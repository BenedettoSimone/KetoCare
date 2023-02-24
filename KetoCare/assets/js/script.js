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
        console.log(data);
        cardsData = data;
        create_cards()
    })
    .catch(error => {
        console.log(`Error: ${error.message}`);
    });


/**
 * Function to create card. This function, for each item received, create a card
 * to show name, surname and fiscal code.
 * @param cardsData: array of items;
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
        img.src = cardData.image_url;
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


/* ================== END PATIENT LIST SECTION ================== */


/* ================== MEASUREMENTS SECTION ================== */

/**
 * Function to fetch average data about a patient. The function get average of a date and previous date.
 * @param fiscal_code: patient fiscal code;
 */

function get_measurements(fiscal_code, requested_date) {

    // compute current date and previous date
    const dates = getCurrentAndPreviousDate(requested_date);

    // create an array to store the fetched data
    const averages = [];

    // fetch data for previous date
    fetchData(fiscal_code, dates.previousDate, (data) => {
        averages.push(data[0]);

        // fetch data for current date
        fetchData(fiscal_code, dates.currentDate, (data) => {
            averages.push(data[0]);
            console.log(averages);

            //LEFT CARD - Previous
            document.querySelector('.cell-1 .card-title span').innerHTML = '| ' + dates.previousDate;
            // check if the average exist
            if (averages[0]) {
                document.querySelector('.cell-1 .ph_average').innerHTML = averages[0].average_value;
            } else {
                document.querySelector('.cell-1 .ph_average').innerHTML = 'N/A';
            }


            //RIGHT CARD - Current
            document.querySelector('.cell-2 .card-title span').innerHTML = '| ' + dates.currentDate;
            // check if the average exist
            if (averages[1]) {
                document.querySelector('.cell-2 .ph_average').innerHTML = averages[1].average_value;
            } else {
                document.querySelector('.cell-2 .ph_average').innerHTML = 'N/A';
            }


            let values_previous = '[0,0,0,0,0,0,0]';
            let values_current = '[5.7,7.6,7.6,5.5,0,0,0]';
            if (averages[0]){
                values_previous = averages[0].values;
            }

            if (averages[1]){
                values_current = averages[1].values;
            }

           updateChart(dates.previousDate, values_previous, dates.currentDate, values_current);



        });
    });

}

/**
 * Function to fetch measurement data with fiscal code and date.
 * @param fiscal_code: patient fiscal code;
 * @param date: timestamp;
 * @param callback:
 */
function fetchData(fiscal_code, date, callback) {
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
        dates.currentDate = "Today";
        dates.previousDate = "Yesterday";
    }
    return dates;
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
        data: JSON.parse(previousData)
    }, {
        name: currentDate,
        data: JSON.parse(currentData)
    }]);

}


/* ================== END MEASUREMENTS SECTION ================== */


/* ================== PATIENT INFO SECTION ================== */


const patientInfoDiv = document.querySelector("#patient-info");


/**
 * Function to search in cardsData array the element with a specific fiscal_code.
 * @param fiscalCode: fiscal code of patient;
 * @returns {*}
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

    img.src = patient.image_url;
    h2.textContent = patient.name + " " + patient.surname;
    h4.textContent = patient.fiscal_code;

    birthdayCard.querySelector("span").textContent = computeAge(patient.birthdate) + " y/old";
    diabetTypeCard.querySelector("span").textContent = "Diabet Type " + patient.diabet_type;
}

/* ================== END PATIENT INFO SECTION ================== */