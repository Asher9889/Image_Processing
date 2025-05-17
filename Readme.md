# Image Detection Project to reduce Dependency to RFID Tag



## 🔧 Tech Stack Breakdown

A concise overview of the tools and libraries used in this project, organized by functionality.

## 🖼️ Frontend
- **Tool / Library**: React (with Axios)  
- **Purpose**: Upload image(Base64) to the backend server.

## ⚙️ Backend
- **Tool / Library**: Node.js + Express  
- **Purpose**: Handle API requests and routing.

## 🧠 Image Embedding
- **Tool / Library**: `@xenova/transformers` `Xenova/clip-vit-base-patch32` (CLIP Model)  
- **Purpose**: Convert uploaded image into a vector representation using a pretrained CLIP model.

## 🗃️ Storage
- **Tool / Library**: MongoDB  
- **Purpose**: Store both the original image link to db (Original Image stored in System) and its corresponding vector embedding.

## 🔍 Matching Algorithm
- **Tool / Library**: Cosine Similarity  
- **Purpose**: Measure similarity between image vectors for image matching and retrieval.

---

## System Design

- Frontend sends base64 image to backend.
- Backend:
   - Converts base64 → Buffer → saves to `uploads/` as file.
   - Passes buffer to CLIP → gets vector.
   - Saves:
      - imagePath: "/uploads/..."
      - vector: [...]
- For matching:
   - Receive base64 from frontend.
   - Get vector, compare against DB vectors using cosine similarity.
   - Return matching documents with imagePath.
- Frontend displays images using path like `http://your-server/uploads/1715862692-image.png`

