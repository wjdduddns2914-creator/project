let allParts = [];
let allProjects = [];


// ========================================
// 데이터 로딩
// ========================================

async function loadData() {

  try {

    const partsResponse =
      await fetch("/api/parts");

    allParts =
      await partsResponse.json();


    const projectResponse =
      await fetch("/api/projects");

    allProjects =
      await projectResponse.json();


    renderProjects();

    renderSelects();

  } catch (error) {

    console.error(
      "데이터 로딩 오류:",
      error
    );

  }

}


// ========================================
// 프로젝트 표시
// ========================================

function renderProjects() {

  const container =
    document.getElementById(
      "projectList"
    );

  container.innerHTML = "";


  allProjects.forEach(project => {

    const card =
      document.createElement("div");

    card.className = "card";


    card.innerHTML = `

      <h3>
        ${project.name}
      </h3>

      <p>
        ${project.description}
      </p>

      <p>
        <strong>
          ${project.sdgs.join(" · ")}
        </strong>
      </p>

      <button
        class="primary"
        onclick="selectProject('${project.id}')"
      >
        프로젝트 선택
      </button>

    `;


    container.appendChild(card);

  });

}


// ========================================
// SELECT 생성
// ========================================

function renderSelects() {

  const projectSelect =
    document.getElementById(
      "projectSelect"
    );


  allProjects.forEach(project => {

    const option =
      document.createElement("option");

    option.value =
      project.id;

    option.textContent =
      project.name;

    projectSelect.appendChild(
      option
    );

  });


  const selects = [
    "partA",
    "partB",
    "buyPart"
  ];


  selects.forEach(selectId => {

    const select =
      document.getElementById(
        selectId
      );


    allParts.forEach(part => {

      const option =
        document.createElement(
          "option"
        );

      option.value =
        part.id;

      option.textContent =
        `${part.name} — ${part.price.toLocaleString()}원`;

      select.appendChild(
        option
      );

    });

  });

}


// ========================================
// 프로젝트 선택
// ========================================

function selectProject(id) {

  document.getElementById(
    "projectSelect"
  ).value = id;


  loadProject();


  scrollToSection(
    "projects"
  );

}


// ========================================
// 프로젝트 부품
// ========================================

async function loadProject() {

  const id =
    document.getElementById(
      "projectSelect"
    ).value;


  if (!id) return;


  const response =
    await fetch(
      `/api/projects/${id}`
    );


  const project =
    await response.json();


  const container =
    document.getElementById(
      "projectParts"
    );


  container.innerHTML = `

    <h3>
      ${project.name}
    </h3>

    <p>
      예상 전체 부품 비용:

      <strong>
        ${project.totalCost.toLocaleString()}원
      </strong>
    </p>

  `;


  project.required.forEach(part => {

    const div =
      document.createElement(
        "div"
      );

    div.className =
      "part";


    div.innerHTML = `

      <span>
        ${part.name}
        × ${part.quantity}
      </span>

      <span class="price">
        ${part.totalPrice.toLocaleString()}원
      </span>

    `;


    container.appendChild(div);

  });

}


// ========================================
// 호환성 검사
// ========================================

async function checkCompatibility() {

  const partA =
    document.getElementById(
      "partA"
    ).value;


  const partB =
    document.getElementById(
      "partB"
    ).value;


  const response =
    await fetch(
      "/api/compatibility",
      {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          partAId: partA,

          partBId: partB

        })

      }
    );


  const result =
    await response.json();


  const container =
    document.getElementById(
      "compatibilityResult"
    );


  let html = `

    <div class="result">

      <h3>
        ${result.partA}
        ↔
        ${result.partB}
      </h3>

      <p
        class="${
          result.compatible
            ? "good"
            : "bad"
        }"
      >

        ${
          result.compatible
            ? "🟢 호환 가능"
            : "🔴 호환 불가"
        }

      </p>

  `;


  result.checks.forEach(check => {

    html += `

      <p>

        <strong>
          ${check.category}
        </strong>

        :

        ${check.result}

      </p>

    `;

  });


  result.warnings.forEach(
    warning => {

      html += `

        <p class="warning">

          ⚠️
          ${warning}

        </p>

      `;

    }
  );


  html += "</div>";


  container.innerHTML =
    html;

}


// ========================================
// 구매처
// ========================================

async function buyPart() {

  const id =
    document.getElementById(
      "buyPart"
    ).value;


  const response =
    await fetch(
      `/api/buy/${id}`
    );


  const result =
    await response.json();


  const container =
    document.getElementById(
      "buyResult"
    );


  container.innerHTML = `

    <div class="result">

      <h3>
        ${result.part}
      </h3>

      <p>

        예상 가격:

        <strong>
          ${result.estimatedPrice.toLocaleString()}원
        </strong>

      </p>


      ${result.stores
        .map(store => `

          <a
            class="store-link"
            href="${store.searchUrl}"
            target="_blank"
            rel="noopener noreferrer"
          >

            🛒
            ${store.store}
            에서 검색

          </a>

        `)
        .join("")}

    </div>

  `;

}


// ========================================
// 스크롤
// ========================================

function scrollToSection(id) {

  document
    .getElementById(id)
    .scrollIntoView({

      behavior: "smooth"

    });

}


// ========================================
// 실행
// ========================================

loadData();