// data format:
// "data": [
//     {
//       "id": 0,
//       "title": "3Sum",
//       "slig": "3-sum",
//       "pattern": [
//         "Arrays"
//       ],
//       "difficulty": "Easy",
//       "premium": false,
//       "solved?": false,
//       "companies": [
//         {
//           "name": "Apple",
//           "frequency": 10
//         },
//         ...
//       ]
//     }
// ]
let data = [];
let filteredData = [];
let initialFilters = {
    title: "",
    difficulty: "",
    company: "",
    unsolved: false
}
let filters = initialFilters;

async function downloadProblems() {
    if (localStorage.getItem("data")) {
        console.log("Loaded from local storage");
        return JSON.parse(localStorage.getItem("data"));
    }

    let response = await fetch("./data.json");
    let data = await response.json();

    localStorage.setItem("data", JSON.stringify(data.data));
    return data.data;
}

function getAllCompanies() {
    let companies = [];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].companies.length; j++) {
            if (!companies.includes(data[i].companies[j].name)) {
                companies.push(data[i].companies[j].name);
            }
        }
    }
    return companies;
}

function updateFilters() {
    let difficulty = document.getElementById("difficulty").value;
    let company = document.getElementById("company").value;
    let unsolved = document.getElementById("unsolved").checked;
    let title = document.getElementById("title").value;

    filters = {
        title: title,
        difficulty: difficulty,
        company: company,
        unsolved: unsolved
    };

    localStorage.setItem("filters", JSON.stringify(filters));
}

function toggleSolved(id) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].id == id) {
            if (data[i].solved) {
                data[i].solved = false;
            } else {
                data[i].solved = true;
            }
            break;
        }

    }
    displayProblems();
    localStorage.setItem("data", JSON.stringify(data));
}

function displayProblems() {
    const table = document.getElementById("problems");
    table.innerHTML = "";
    filteredData = filterProblems();
    for (let i = 0; i < filteredData.length; i++) {
        const row = table.insertRow(-1);
        const solved = filteredData[i].solved === true;
        const solvedCheckbox = document.createElement("input");
        solvedCheckbox.type = "checkbox";
        solvedCheckbox.checked = solved;
        row.insertCell(-1).appendChild(solvedCheckbox);
        solvedCheckbox.onclick = () => toggleSolved(filteredData[i].id);

        if (solved) {
            row.classList.add("solved");
        }

        row.insertCell(-1).innerHTML = filteredData[i].id;

        const name = document.createElement("a");
        name.href = `https://leetcode.com/problems/${filteredData[i].slug}`;
        name.innerHTML = filteredData[i].title;
        name.target = "_blank";
        row.insertCell(-1).appendChild(name);

        row.insertCell(-1).innerHTML = `<span class="${filteredData[i].difficulty}">${filteredData[i].difficulty}<\span>`;

        row.insertCell(-1).innerHTML = filteredData[i].premium ? "Premium" : "Free";

        const companies = document.createElement("ul");
        for (let j = 0; j < filteredData[i].companies.length; j++) {
            const company = document.createElement("li");
            company.innerHTML = filteredData[i].companies[j].name;
            companies.appendChild(company);
        }
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerHTML = "Companies";
        details.appendChild(summary);
        details.appendChild(companies);
        row.insertCell(-1).appendChild(details);
    }

    console.log("Render done");
}

function filterProblems() {
    console.log(filters);
    filteredData = data.filter((problem) => {
        if (filters.name && !problem.title.toLowerCase().includes(filters.name.toLowerCase())) {
            return false;
        }

        if (filters.difficulty && problem.difficulty != filters.difficulty) {
            return false;
        }

        if (filters.company && !problem.companies.some((company) => company.name == filters.company)) {
            return false;
        }

        if (filters.unsolved && problem.solved) {
            console.log(filters.unsolved, problem.unsolved)
            return false;
        }

        return true;
    })
    return filteredData;
}

function updateInputs()
{
    document.getElementById("difficulty").value = filters.difficulty;
    document.getElementById("company").value = filters.company;
    document.getElementById("unsolved").checked = filters.unsolved;
    document.getElementById("title").value = filters.title;
}

window.onload = async function () {
    data = await downloadProblems();

    if (localStorage.getItem("filters")) {
        filters = JSON.parse(localStorage.getItem("filters"));
        console.log("Loaded filters from local storage");
    }
    
    const companySelect = document.getElementById("company");
    companySelect.appendChild(document.createElement("option"));
    const companies = getAllCompanies();
    for (let i = 0; i < companies.length; i++) {
        const option = document.createElement("option");
        option.value = companies[i];
        option.innerHTML = companies[i];
        companySelect.appendChild(option);
    }
    
    updateInputs();
    displayProblems();
};

document.getElementById("go").addEventListener("click", () => {
    updateFilters();
    displayProblems();
});

document.getElementById("refresh").addEventListener("click", () => {
    let proceed = confirm("Are you sure you want to refresh? This will delete all your progress.");
    if (!proceed) {
        return;
    }

    localStorage.removeItem("data");
    localStorage.removeItem("filters");
    downloadProblems();
    location.reload();
});

document.getElementById("clear").addEventListener("click", () => {
    localStorage.removeItem("filters");
    location.reload();
});

document.getElementById("random").addEventListener("click", () => {
    let random = Math.floor(Math.random() * filteredData.length);
    window.open(`https://leetcode.com/problems/${filteredData[random].slug}`, "_blank");
});