export const uploadImage = async (file) => {
  const CLOUD_NAME = "your_cloud_name"; // 👉 thay bằng Cloudinary cloud name của mày
  const UPLOAD_PRESET = "your_unsigned_preset"; // 👉 preset mày tạo trên Cloudinary

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  return data.secure_url;
};
