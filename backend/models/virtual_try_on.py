from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class VirtualTryOnImageBase(BaseModel):
    product_id: str = Field(..., description="Product ID")
    user_id: Optional[str] = Field(None, description="User ID (optional for anonymous)")
    image_base64: str = Field(..., description="Base64 encoded generated image")

class VirtualTryOnImageCreate(VirtualTryOnImageBase):
    pass

class VirtualTryOnImageInDB(VirtualTryOnImageBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class VirtualTryOnImageResponse(VirtualTryOnImageBase):
    id: str
    created_at: datetime

class VirtualTryOnImagesResponse(BaseModel):
    images: list[VirtualTryOnImageResponse]
    total: int