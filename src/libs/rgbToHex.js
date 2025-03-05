export const rgbToHex = (rgb) => {
  const match = rgb.match(/\d+/g); // Ambil angka dari format rgb(r, g, b
  if (!match || match.length < 3) return null;
  const hex = match
    .slice(0, 3) // Ambil hanya 3 angka pertama
    .map((num) => Number(num).toString(16).padStart(2, "0")) // Konversi ke hexa
    .join("");
  return `#${hex}`;
};
