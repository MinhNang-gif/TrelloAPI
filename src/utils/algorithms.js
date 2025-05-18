// Tinh toan gia tri skip cho tac vu phan trang
export const pagingSkipValue = (page, itemsPerPage) => { // page la trang hien tai dang dung, itemsPerPage la so luong ban ghi tren trang do
  // Luon dam bao neu gia tri kh hop le thi return ve 0 het
  if (!page || !itemsPerPage) return 0
  if (page <= 0 || itemsPerPage <= 0) return 0

  return (page - 1) * itemsPerPage
}
