export function useImageDimensions(imageUrl) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const aspectRatio = img.height / img.width
      resolve(aspectRatio)
    }
    img.src = imageUrl
  })
}
