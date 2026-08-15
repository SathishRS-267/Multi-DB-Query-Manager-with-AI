from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timedelta

from auth.schemas import UserCreate, UserResponse, PasswordReset, PasswordResetConfirm, Token
from auth.models import User
from auth.utils import (
    get_password_hash, 
    verify_password, 
    create_access_token, 
    generate_reset_token, 
    send_reset_email
)
from auth.dependencies import get_current_user, get_user_by_email, get_user_by_username
from database import get_db
from config import settings

router = APIRouter()


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    existing_email = await get_user_by_email(db, user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    existing_username = await get_user_by_username(db, user_data.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password
    )
    
    try:
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        # Return user without hashed password
        return new_user
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed"
        )


@router.post("/login", response_model=Token)
async def login(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    # Form data username is actually email in our case
    user = await get_user_by_email(db, form_data.username)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    # Set cookie with token
    response.set_cookie(
        key="access_token",
        value=f"Bearer {access_token}",
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,  # Set to True in production with HTTPS
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(reset_data: PasswordReset, db: AsyncSession = Depends(get_db)):
    # Find user by email
    user = await get_user_by_email(db, reset_data.email)
    
    # For security reasons, always return success even if email doesn't exist
    if not user:
        return {"detail": "If an account with this email exists, a password reset link has been sent."}
    
    # Generate reset token
    reset_token = generate_reset_token()
    expiration = datetime.utcnow() + timedelta(hours=1)
    
    # Save token to database
    user.reset_token = reset_token
    user.reset_token_expires = expiration
    
    try:
        await db.commit()
        
        # Send email with reset link
        email_sent = await send_reset_email(user.email, reset_token)
        
        if not email_sent:
            # Log the failure but don't tell the user (for security)
            print(f"Failed to send password reset email to {user.email}")
        
        return {"detail": "If an account with this email exists, a password reset link has been sent."}
    except Exception as e:
        await db.rollback()
        print(f"Error in forgot password process: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset request failed"
        )


@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(reset_data: PasswordResetConfirm, db: AsyncSession = Depends(get_db)):
    # Find user by reset token
    result = await db.execute(select(User).where(User.reset_token == reset_data.token))
    user = result.scalars().first()
    
    # Check if token exists and is valid
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )
    
    # Update password
    user.hashed_password = get_password_hash(reset_data.new_password)
    # Clear reset token
    user.reset_token = None
    user.reset_token_expires = None
    
    try:
        await db.commit()
        return {"detail": "Password has been reset successfully"}
    except Exception:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Password reset failed"
        )


# @router.post("/logout")
# async def logout(response: Response):
#     response.delete_cookie(key="access_token")
#     return {"detail": "Successfully logged out"}


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(
        key="access_token",
        httponly=True,       # Optional but safe to match
        samesite="lax",      # Match your original setting
        secure=False,        # Match the `secure` you used in set_cookie
        path="/"             # Default path unless you set a different one
    )
    return {"detail": "Successfully logged out"}



@router.get("/me", response_model=UserResponse)
async def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user