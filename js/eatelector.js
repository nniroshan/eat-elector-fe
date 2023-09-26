const EAT_ELECTOR_API_BASE_URL = "http://localhost:8080";
const API_ENDPOINT_ADD_RESTAURANT = EAT_ELECTOR_API_BASE_URL + "/restaurant"
const API_ENDPOINT_GET_RANDOM_RESTAURANT = EAT_ELECTOR_API_BASE_URL + "/restaurant/random"

const RESPONSE_STATUS_SUCCESS = "SUCCESS";
const RESPONSE_STATUS_ERROR = "ERROR";
const RESPONSE_STATUS_NO_RECORDS_FOUND = "NO_RECORDS_FOUND";


$(document).ready(function(){

    $("#addRestaurantForm").submit(function(event) {
        event.preventDefault();
        let restaurantName = $("#restaurantName").val().trim();
        if(!isValidRestaurantName(restaurantName)) {
            return;
        }
        addNewRestaurant(restaurantName);

    });

    $("#btnShowRandomRestaurant").click(function() {
        displayRandomRestaurant();
    });

    $("#btnNewLunch").click(function() {
        $("#newLunchConfirmationModal").modal('toggle');
    });

});

function isValidRestaurantName(restaurantName) {
    if(restaurantName.length < 1 || restaurantName.length > 255) {
        displayMessageDialog("Invalid Restaurant Name",
            "Length of the restaurant name must be between 1 to 255 characters");
        return false;
    }
    return true;
}

function displayMessageDialog(title, message) {
    $("#messageDialogTitle").text(title);
    $("#messageDialogMessageBody").text(message);
    $("#messageDialogModal").modal('toggle');
}

function displayRandomRestaurantModal(restaurantName) {
    $("#randomRestaurantModalBody").text(restaurantName);
    $("#randomRestaurantModal").modal('toggle');
}

function resetForm() {
    $("#restaurantName").val("");
}

function addNewRestaurant(restaurantName) {

    const requestBody = { restaurantName : restaurantName };

    const requestOptions = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    }

    fetch(API_ENDPOINT_ADD_RESTAURANT, requestOptions)
        .then(response => {
            if (!response.ok) {
                displayMessageDialog("Error Occurred!", "Please try again later!");
            }
            return response.json();
        })
        .then(data => {

            if(data.status == RESPONSE_STATUS_SUCCESS) {
                displayMessageDialog("Done!", data.message);
                resetForm();
            } else {
                displayMessageDialog("Error!", data.message);
            }

        })
        .catch(error => {
            displayMessageDialog("Error!", "Please try again later.");
            console.error('There was a problem with the fetch operation:', error);
        });

}

function displayRandomRestaurant() {
    fetch(API_ENDPOINT_GET_RANDOM_RESTAURANT)
        .then(response => {
            if (!response.ok) {

                if(response.status == 404) {
                    response.json()
                        .then(error => {
                            if(error.status == RESPONSE_STATUS_NO_RECORDS_FOUND) {
                                displayMessageDialog("No Restaurants to Chose From", error.message);
                                return;
                            }
                        });
                }
                displayMessageDialog("Error Occurred!", "Please try again later!");
                return;
            }
            return response.json();
        })
        .then(responseBody => {

            if(!responseBody) {
                return;
            }

            switch (responseBody.status) {
                case RESPONSE_STATUS_SUCCESS:
                    displayRandomRestaurantModal(responseBody.restaurantName);
                    break;
                case RESPONSE_STATUS_NO_RECORDS_FOUND:
                    displayMessageDialog("No Restaurants to Chose From", responseBody.message);
                    break;
                case RESPONSE_STATUS_ERROR:
                    displayMessageDialog("Error!", responseBody.message);
                    break;
                default:
                    displayMessageDialog("Error!", "Please try again later!");
            }

        })
        .catch(error => {
            console.error("Fetch error:", error);
            displayMessageDialog("Error occurred!", "Please try again later!");
        });
}