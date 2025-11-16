import httpx
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Optional
import logging
from datetime import datetime

from models.virtual_try_on import VirtualTryOnImageCreate, VirtualTryOnImagesResponse
from database.mongodb import MongoDB
from auth.dependencies import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/virtual-try-on", tags=["Virtual Try-On"])

VIRTUAL_TRY_ON_BACKEND_URL = "http://localhost:8011/api/virtual-try-on"

@router.post("/")
async def virtual_try_on(
    vton_image: UploadFile = File(..., description="Person image"),
    garment_image: UploadFile = File(..., description="Garment image"),
    product_id: Optional[str] = Form(None),
    current_user = Depends(get_current_user)
):
    """
    Virtual Try-On API Endpoint that proxies to Virtual-TryOn-Backend and stores images
    """
    logger.info("Received virtual try-on request")

    try:
        # Prepare form data for the backend
        form_data = {
            'vton_image': (vton_image.filename, await vton_image.read(), vton_image.content_type),
            'garment_image': (garment_image.filename, await garment_image.read(), garment_image.content_type)
        }

        # Call the Virtual-TryOn-Backend
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(VIRTUAL_TRY_ON_BACKEND_URL, files=form_data)

            if response.status_code != 200:
                logger.error(f"Virtual-TryOn-Backend returned {response.status_code}: {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Virtual try-on service error"
                )

            result = response.json()

        if result.get("status") == "ok" and result.get("image_base64"):
            # Store the image in database
            image_data = VirtualTryOnImageCreate(
                product_id=product_id,
                user_id=current_user.id if current_user else None,
                image_base64=result["image_base64"]
            )

            # Insert into MongoDB
            collection = MongoDB.get_collection("virtual_try_on_images")
            doc = image_data.dict()
            doc["created_at"] = datetime.utcnow()
            insert_result = await collection.insert_one(doc)

            # Add the ID to the response
            result["image_id"] = str(insert_result.inserted_id)

            logger.info("Virtual try-on completed and image stored successfully")
            return JSONResponse(content=result)
        else:
            logger.warning("Virtual try-on completed but no image generated")
            return JSONResponse(content=result)

    except httpx.TimeoutException:
        logger.error("Request to Virtual-TryOn-Backend timed out")
        raise HTTPException(
            status_code=504,
            detail="Virtual try-on service timeout. Please try again."
        )
    except httpx.RequestError as e:
        logger.error(f"Request error to Virtual-TryOn-Backend: {e}")
        raise HTTPException(
            status_code=503,
            detail="Virtual try-on service unavailable. Please try again later."
        )
    except Exception as e:
        logger.error(f"Unexpected error in virtual try-on: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error. Please try again later."
        )

@router.get("/images/{product_id}")
async def get_virtual_try_on_images(product_id: str):
    """
    Get all generated virtual try-on images for a product
    """
    try:
        collection = MongoDB.get_collection("virtual_try_on_images")
        cursor = collection.find({"product_id": product_id}).sort("created_at", -1)
        images = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            images.append(doc)

        return VirtualTryOnImagesResponse(images=images, total=len(images))

    except Exception as e:
        logger.error(f"Error fetching virtual try-on images: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch images"
        )