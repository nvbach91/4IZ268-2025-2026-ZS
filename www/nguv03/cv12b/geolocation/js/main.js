const getCoordinatesButton = $('#get-coordinates');

getCoordinatesButton.on('click', () => {
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position);
    });
});
