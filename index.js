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
    difficulty: "",
    company: "",
    pattern: "",
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

function getAllPatterns() {
    let patterns = [];
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].pattern.length; j++) {
            if (!patterns.includes(data[i].pattern[j])) {
                patterns.push(data[i].pattern[j]);
            }
        }
    }
    return patterns;
}

function updateFilters() {
    let difficulty = document.getElementById("difficulty").value;
    let company = document.getElementById("company").value;
    let pattern = document.getElementById("pattern").value;
    let unsolved = document.getElementById("unsolved").checked;

    filters = {
        difficulty: difficulty,
        company: company,
        pattern: pattern,
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
    let solvedCount = 0;
    table.innerHTML = "";
    filteredData = filterProblems();
    for (let i = 0; i < filteredData.length; i++) {
        let current = filteredData[i];
        const row = table.insertRow(-1);
        const solved = current.solved === true;
        const solvedCheckbox = document.createElement("input");
        solvedCheckbox.id = current.id;
        solvedCheckbox.type = "checkbox";
        solvedCheckbox.checked = solved;
        cell = row.insertCell(-1)
        cell.appendChild(solvedCheckbox);
        cell.onclick = () => toggleSolved(current.id);

        if (solved) {
            row.classList.add("solved");
            solvedCount++;
        }

        row.insertCell(-1).innerHTML = current.id;

        const name = document.createElement("a");
        name.href = `https://leetcode.com/problems/${current.slug}`;
        name.innerHTML = current.title;
        name.target = "_blank";
        name.classList.add("problem-link")
        row.insertCell(-1).appendChild(name);

        row.insertCell(-1).innerHTML = `<span class="${current.difficulty}">${current.difficulty}<\span>`;

        row.insertCell(-1).innerHTML = current.premium ? "Premium" : "Free";

        const patterns = document.createElement("ul");
        for (let j = 0; j < current.pattern.length; j++) {
            const pattern = document.createElement("li");
            pattern.innerHTML = current.pattern[j];
            patterns.appendChild(pattern);
        }
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.innerHTML = "Patterns";
        details.appendChild(summary);
        details.appendChild(patterns);
        row.insertCell(-1).appendChild(details);

        const companies = document.createElement("ul");
        for (let j = 0; j < current.companies.length; j++) {
            const company = document.createElement("li");
            company.innerHTML = current.companies[j].name;
            companies.appendChild(company);
        }

        const details1 = document.createElement("details");
        const summary1 = document.createElement("summary");
        summary1.innerHTML = "Companies";
        details1.appendChild(summary1);
        details1.appendChild(companies);
        row.insertCell(-1).appendChild(details1);
    }

    document.getElementById("solved-count").innerHTML = solvedCount;
    document.getElementById("total-count").innerHTML = data.length;
    console.log("Render done");
}

function filterProblems() {
    console.log(filters);
    filteredData = data.filter((problem) => {
        if (filters.difficulty && problem.difficulty != filters.difficulty) {
            return false;
        }

        if (filters.company && !problem.companies.some((company) => company.name == filters.company)) {
            return false;
        }

        if (filters.pattern && !problem.pattern.some((pattern) => pattern == filters.pattern)) {
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

function updateInputs() {
    document.getElementById("difficulty").value = filters.difficulty;
    document.getElementById("company").value = filters.company;
    document.getElementById("pattern").value = filters.pattern;
    document.getElementById("unsolved").checked = filters.unsolved;
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

    const patternSelect = document.getElementById("pattern");
    patternSelect.appendChild(document.createElement("option"));
    const patterns = getAllPatterns();
    for (let i = 0; i < patterns.length; i++) {
        const option = document.createElement("option");
        option.value = patterns[i];
        option.innerHTML = patterns[i];
        patternSelect.appendChild(option);
    }

    updateInputs();
    displayProblems();
};

function focusProblem(filteredIndex) {
    let table = document.getElementById("problems");
    for (let i = 0; i < table.rows.length; i++) {
        table.rows[i].classList.remove("focus");
    }
    let row = table.rows[filteredIndex];
    row.classList.add("focus");
    row.scrollIntoView();
}

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
    console.log(filteredData[random].slug);
    focusProblem(random);
});

document.getElementById("difficulty").addEventListener("change", () => {
    go();
});

document.getElementById("company").addEventListener("change", () => {
    go();
});

document.getElementById("pattern").addEventListener("change", () => {
    go();
});

document.getElementById("unsolved").addEventListener("change", () => {
    go();
});


function go() {
    updateFilters();
    displayProblems();
}
