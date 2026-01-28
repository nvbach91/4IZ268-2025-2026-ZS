
// toust notification system
export const showToast = (message, type = 'info') => {
    const toast = $(`<div class="toast ${type}">${message}</div>`);
    $('#toast-container').append(toast);


    setTimeout(() => toast.addClass('show'), 10);


    setTimeout(() => {
        toast.removeClass('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};