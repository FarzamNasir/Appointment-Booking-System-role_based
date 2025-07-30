
from fastapi import APIRouter, HTTPException, status, Depends
from app.schemas.admin import AdminCreate, AdminLogin
from app.services.admin_service import AdminService
from app.utils.jwt import create_access_token, verify_access_token
from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/signup")
async def admin_signup(data: AdminCreate):
    try:
        admin_id = await AdminService.create_admin(data.username, data.password)
        return {"message": "Admin created", "admin_id": admin_id}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Accept OAuth2PasswordRequestForm for token endpoint
@router.post("/login")
async def admin_login(form_data: OAuth2PasswordRequestForm = Depends()):
    admin_id = await AdminService.authenticate_admin(form_data.username, form_data.password)
    if not admin_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    access_token = create_access_token({"sub": form_data.username})
    return {"access_token": access_token, "token_type": "bearer"}

# Example protected endpoint
@router.get("/me")
async def get_admin_me(username: str = Depends(verify_access_token)):
    return {"username": username}
