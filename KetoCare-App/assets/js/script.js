
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
function create_cards(){
    const cardsContainer = document.getElementById("cards-container");

    // create the patient list
    cardsData.forEach((cardData, index) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.setAttribute("id", cardData.fiscal_code);

        const leftCard = document.createElement("div");
        leftCard.classList.add("left-card");

        const img = document.createElement("img");
        img.src = "./assets/img/patient_1.jpg";
        leftCard.appendChild(img);

        const rightCard = document.createElement("div");
        rightCard.classList.add("right-card");

        const name = document.createElement("h2");
        name.innerText = cardData.name +" "+ cardData.surname;
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

    img.src = "./assets/img/patient_1.jpg";
    h2.textContent = patient.name +" "+patient.surname;
    h4.textContent = patient.fiscal_code;

    birthdayCard.querySelector("span").textContent = computeAge(patient.birthdate) + " y/old";
    diabetTypeCard.querySelector("span").textContent = "Diabet Type " + patient.diabet_type;
}

/* ================== END PATIENT INFO SECTION ================== */