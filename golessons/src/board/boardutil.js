const getLocHash = (stone) => {
  const { x, y } = stone;
  return x * 100 + y;
}

export default getLocHash