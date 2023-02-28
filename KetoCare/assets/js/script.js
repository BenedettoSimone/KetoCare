/* ================== PATIENT LIST SECTION ================== */

let cardsData = [];

/**
 * Get all patients and start with create cards.
 */
fetch('http://localhost:5000/patients', {
    method: 'GET',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`Error: status code ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if(data.length > 0){
            cardsData = data;
            document.querySelector("#cards-container h5").style.display = "none";
            document.querySelector("#left-content #list-container #cards-container").style.textAlign = "left";
            document.querySelector("#right-content #bg-right .container").style.display = "grid";
            create_cards()
        }

    })
    .catch(error => {
        console.log(`Error: ${error.message}`);
    });


/**
 * Function to create card. This function, for each item received, creates a card
 * to show name, surname and fiscal code.
 */
function create_cards() {
    const cardsContainer = document.getElementById("cards-container");

    // create the patient list
    cardsData.forEach((cardData, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.setAttribute("id", cardData.fiscal_code);

        const leftCard = document.createElement("div");
        leftCard.classList.add("left-card");

        const img = document.createElement("img");

        if (cardData.image_url != undefined) {
            img.src = cardData.image_url;
        } else {
            img.src = "./assets/img/patient.png";
        }

        leftCard.appendChild(img);

        const rightCard = document.createElement("div");
        rightCard.classList.add("right-card");

        const name = document.createElement("h2");
        name.innerText = cardData.name + " " + cardData.surname;
        rightCard.appendChild(name);

        const id = document.createElement("h5");
        id.innerText = cardData.fiscal_code;
        rightCard.appendChild(id);

        card.appendChild(leftCard);
        card.appendChild(rightCard);

        cardsContainer.appendChild(card);

        // set first card to active
        if (index === 0) {
            card.classList.add("active");
            displayPatientInfo(card.id);
            get_measurements(card.id, "")
        }
    });

    const cards = document.querySelectorAll(".card");

    // add listener to each card
    cards.forEach((card) => {
        card.addEventListener("click", () => {
            // remove active from the last clicked element
            const activeCard = document.querySelector(".card.active");
            activeCard.classList.remove("active");

            // set active
            card.classList.add("active");

            // display info in Patient info card
            displayPatientInfo(card.id);

            //set average and measurements data
            get_measurements(card.id, "")

            const input = document.getElementById('date');
            input.value = '';
        });
    });
}

const searchInput = document.querySelector(".search-bar input");
const clearBtn = document.querySelector(".search-bar .clear-btn");

/**
 * Function to show all card after removing filter in search bar.
 */
function showAllCards() {
    const cards = document.querySelectorAll(".card");
    cards.forEach((card) => {
        card.style.display = "flex";
    });
}

/**
 * Add listener on clear button to remove the input text and show all cards.
 */
clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    clearBtn.classList.add("hide");
    showAllCards();
});


/**
 * Function that, based on input in search bar, show the correct card.
 */
searchInput.addEventListener("input", () => {
    if (searchInput.value !== "") {
        clearBtn.classList.remove("hide");
        const searchValue = searchInput.value.toUpperCase();
        const cards = document.querySelectorAll(".card");

        cards.forEach((card) => {
            const id = card.getAttribute("id");
            if (id.toUpperCase().indexOf(searchValue) > -1) {
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }
        });
    } else {
        clearBtn.classList.add("hide");
        showAllCards();
    }
});


/**
 * Modal to add new user
 */
const modal = document.getElementById("new-user-modal");
    const btn = document.getElementById("new-user-button");
    const close_modal = document.querySelector("#new-user-modal .close");

    btn.onclick = function () {
        modal.style.display = "flex";
    }

    close_modal.onclick = function () {
        modal.style.display = "none";
        form.reset();
    }

    const form = document.querySelector("#new-user-modal form");

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Avoid reloading

        const image = document.getElementById("image-input").files[0];
        // LowerCase and Capitalize
        const name = document.getElementById("name").value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        const surname = document.getElementById("surname").value.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

        // UpperCase
        const cf = document.getElementById("cf").value.toUpperCase();
        const date = document.getElementById("date-modal").value;
        const diabetType = document.querySelector("#new-user-modal input[name='diabet-type']:checked").value;

        const formData = new FormData();

        if(image != null){
            formData.append("image", image);
        }

        formData.append("name", name);
        formData.append("surname", surname);
        formData.append("cf", cf);
        formData.append("date", date);
        formData.append("diabetType", diabetType);

        fetch('http://localhost:5000/savePatient', {
            method: 'POST',
            mode: 'cors',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error: status code ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                form.reset();
                document.querySelector("#place-image").style.backgroundImage = `url(../img/patient.png)`;
                modal.style.display = "none";
                console.log("Upload done!");
                location.reload()
            })
            .catch(error => {
                console.log(`Error: ${error.message}`);
            });

        const modal = document.getElementById("new-user-modal");
        form.reset();
        modal.style.display = "none";
    });


/* ================== END PATIENT LIST SECTION ================== */


/**
 * Hide and show sidebar
 */
let content = document.querySelector('#left-content');
let openButton = document.querySelector('#toggle-left-content');
let closeButton = document.querySelector('#button-close');

openButton.addEventListener('click', function () {
    if (content.classList.contains('show-left-content')) {
        content.classList.remove('show-left-content');
        content.classList.add('hide-left-content');
    } else {
        content.classList.remove('hide-left-content');
        content.classList.add('show-left-content');
    }
});

closeButton.addEventListener('click', function () {
        content.classList.remove('show-left-content');
        content.classList.add('hide-left-content');
});


/* ================== MEASUREMENTS SECTION ================== */

/**
 * Function to fetch average data about a patient. The function get average of a date and previous date.
 * @param fiscal_code: patient fiscal code;
 * @param requested_date: to get measurements about past dates (!= current day)
 */

function get_measurements(fiscal_code, requested_date) {

    // compute current date and previous date
    const dates = getCurrentAndPreviousDate(requested_date);

    // create an array to store the fetched data
    const averages = [];

    // fetch data for previous date
    fetchAverage(fiscal_code, dates.previousDate, (data) => {
        averages.push(data[0]);

        // fetch data for current date
        fetchAverage(fiscal_code, dates.currentDate, (data) => {
            averages.push(data[0]);

            //LEFT CARD - Previous
            document.querySelector('.cell-1 .card-title span').innerHTML = '| ' + dates.previousDate;
            // check if the average exist
            if (averages[0]) {
                document.querySelector('.cell-1 .ph_average').innerHTML = averages[0].average_value;
            } else {
                document.querySelector('.cell-1 .ph_average').innerHTML = 'N/A';
            }


            //RIGHT CARD - Current
            document.querySelector('.cell-2 .card-title span').innerHTML = '| '+ dates.currentDate;
            // check if the average exist
            if (averages[1]) {
                document.querySelector('.cell-2 .ph_average').innerHTML = averages[1].average_value;
            } else {
                document.querySelector('.cell-2 .ph_average').innerHTML = 'N/A';
            }
        });
    });


    const measurements = [];
    fetchMeasurements(fiscal_code, dates.previousDate, (data) => {
        measurements.push(data);

        fetchMeasurements(fiscal_code, dates.currentDate, (data) => {
            measurements.push(data);
            console.log(measurements);

            let values_previous = [];
            let values_current = [];

            for(let i = 0; i < measurements[0].length; i++){
                values_previous.push(parseFloat(measurements[0][i].measured_value));
            }
            for(let i = 0; i < measurements[1].length; i++){
                values_current.push(parseFloat(measurements[1][i].measured_value));
            }
            updateChart(dates.previousDate, values_previous, dates.currentDate, values_current);
        });
    });
}

/**
 * Function to fetch average data with fiscal code and date.
 * @param fiscal_code: patient fiscal code;
 * @param date: timestamp;
 * @param callback: callback function;
 */
function fetchAverage(fiscal_code, date, callback) {
    const input = {
        fiscal_code: fiscal_code,
        date: date
    };

    fetch('http://localhost:5000/average', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: status code ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.log(`Error: ${error.message}`);
        });
}

/**
 * Function to compute current date and previous date.
 * @param requested_date: date in format YYYY-MM-DD;
 * @returns {{}} : current date and previous date;
 */
function getCurrentAndPreviousDate(requested_date) {
    const dates = {}
    if (requested_date) {
        const date = new Date(requested_date);
        const previousDate = new Date(date);
        previousDate.setDate(date.getDate() - 1);
        const todayFormatted = date.toISOString().split('T')[0];
        const previousDateFormatted = previousDate.toISOString().split('T')[0];
        dates.currentDate = todayFormatted;
        dates.previousDate = previousDateFormatted;

    } else {
        const today = new Date();
        const previousDate = new Date(today);
        previousDate.setDate(today.getDate() - 1);
        const todayFormatted = today.toISOString().split('T')[0];
        const previousDateFormatted = previousDate.toISOString().split('T')[0];
        dates.currentDate = todayFormatted;
        dates.previousDate = previousDateFormatted;
    }
    return dates;
}

/**
 * Function to fetch measurements data with fiscal code and date.
 * @param fiscal_code: fiscal code of patient;
 * @param date: date;
 * @param callback: callback function;
 */
function fetchMeasurements(fiscal_code, date, callback) {
    const input = {
        fiscal_code: fiscal_code,
        date: date
    };

    fetch('http://localhost:5000/measurements', {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error: status code ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            callback(data);
        })
        .catch(error => {
            console.log(`Error: ${error.message}`);
        });
}

/**
 * Function to update series in line chart.
 * @param previousDate: previous date;
 * @param previousData: series data of previous date;
 * @param currentDate: current date;
 * @param currentData: series data of current date;
 */
function updateChart(previousDate, previousData, currentDate, currentData) {

    chart.updateSeries([{
        name: previousDate,
        data: previousData
    }, {
        name: currentDate,
        data: currentData
    }]);

}
/* ================== END MEASUREMENTS SECTION ================== */


/* ================== PATIENT INFO SECTION ================== */
const patientInfoDiv = document.querySelector("#patient-info");

/**
 * Function to search in cardsData array the element with a specific fiscal_code.
 * @param fiscalCode: fiscal code of patient;
 * @returns {*}: element with fiscal code input.
 */
const findPatientByFiscalCode = (fiscalCode) => {
    return cardsData.find(patient => patient.fiscal_code === fiscalCode);
}

/**
 * Function to compute age of patient.
 * @param birthdate: birth date in format "GG/MM/AAAA";
 * @returns {number}: age;
 */
function computeAge(birthdate) {
    const today = new Date();
    const birthdateArray = birthdate.split('/');
    const birthdateObject = new Date(birthdateArray[2], birthdateArray[1] - 1, birthdateArray[0]);
    let age = today.getFullYear() - birthdateObject.getFullYear();
    const monthDiff = today.getMonth() - birthdateObject.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdateObject.getDate())) {
        age--;
    }
    return age;
}

/**
 * Function to set up info about patient in the dedicated section.
 * @param fiscalCode: fiscal code of patient;
 */
function displayPatientInfo(fiscalCode) {

    const patient = findPatientByFiscalCode(fiscalCode);

    const img = patientInfoDiv.querySelector("img");
    const h2 = patientInfoDiv.querySelector("h2");
    const h4 = patientInfoDiv.querySelector("h4");
    const birthdayCard = patientInfoDiv.querySelector("#birthday");
    const diabetTypeCard = patientInfoDiv.querySelector("#diabet_type");

    if (patient.image_url !== undefined){
         img.src = patient.image_url;
    }else{
        img.src = './assets/img/patient.png';
    }

    h2.textContent = patient.name + " " + patient.surname;
    h4.textContent = patient.fiscal_code;

    birthdayCard.querySelector("span").textContent = computeAge(patient.birthdate) + " y/old";
    diabetTypeCard.querySelector("span").textContent = "Diabet Type " + patient.diabet_type;
}

/* ================== END PATIENT INFO SECTION ================== */