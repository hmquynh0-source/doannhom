const formatCurrency = (amount) => {
    // Xử lý NaN, null, undefined hoặc 0
    if (isNaN(amount) || amount === null || amount === undefined) {
        return 'N/A';
    }
    // Định dạng số (ví dụ: tiền tệ Việt Nam Đồng)
    // Nếu bạn chỉ cần định dạng số, có thể bỏ style: 'currency'
    return new Intl.NumberFormat('vi-VN', { 
        style: 'decimal', // Hoặc 'currency', currency: 'VND' 
        minimumFractionDigits: 0 
    }).format(amount);
};