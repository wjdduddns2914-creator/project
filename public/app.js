let allParts = [];
let allProjects = [];

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const responseText = await response.text();
  let result;

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    throw new Error(
      "서버 응답을 읽을 수 없습니다. 페이지를 새로고침하거나 서버를 다시 실행해 주세요."
    );
  }

  if (!response.ok) {
    throw new Error(result.error || `요청에 실패했습니다. (${response.status})`);
  }

  return result;
}

// 데이터 로딩
async function loadData() {
  try {
    allParts = await requestJson("/api/parts");
    allProjects = await requestJson("/api/projects");

    renderProjects();
    renderSelects();
  } catch (error) {
    console.error("데이터 로딩 오류:", error);
    document.getElementById("projectList").innerHTML = `
      <div class="result"><p class="warning">${error.message}</p></div>
    `;
  }
}

// 프로젝트 표시
function renderProjects() {
  const container = document.getElementById("projectList");
  container.innerHTML = "";

  allProjects.forEach(project => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <h3>${project.name}</h3>
      <p>${project.description}</p>
      <p><strong>${project.sdgs.join(" · ")}</strong></p>
      <button class="primary" onclick="selectProject('${project.id}')">
        프로젝트 선택
      </button>
    `;

    container.appendChild(card);
  });
}

// Select 생성
function renderSelects() {
  const projectSelect = document.getElementById("projectSelect");

  allProjects.forEach(project => {
    const option = document.createElement("option");
    option.value = project.id;
    option.textContent = project.name;
    projectSelect.appendChild(option);
  });

  const selects = ["partA", "partB", "buyPart"];

  selects.forEach(selectId => {
    const select = document.getElementById(selectId);

    allParts.forEach(part => {
      const option = document.createElement("option");
      option.value = part.id;
      option.textContent =
        `${part.name} — ${part.price.toLocaleString()}원`;

      select.appendChild(option);
    });
  });
}

// 프로젝트 선택
function selectProject(id) {
  document.getElementById("projectSelect").value = id;
  loadProject();
  scrollToSection("projects");
}

// 입력한 기기에 맞는 제작 계획
async function findDevicePlan() {
  const input = document.getElementById("deviceInput");
  const container = document.getElementById("devicePlanResult");
  const device = input.value.trim();

  if (!device) {
    container.innerHTML = `<p class="warning">기기 이름이나 핵심 부품을 입력해 주세요.</p>`;
    input.focus();
    return;
  }

  container.innerHTML = "<p>관련 부품을 찾는 중입니다...</p>";

  try {
    const result = await requestJson("/api/device-plan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ device })
    });

    if (!result.matches.length) {
      container.innerHTML = `<div class="result"><p class="warning">${result.message}</p></div>`;
      return;
    }

    container.innerHTML = result.matches.map(match => `
      <div class="result device-plan">
        <h3>${match.projectName}</h3>
        <p>${match.description}</p>
        <p>예상 부품 비용: <strong>${match.totalCost.toLocaleString()}원</strong></p>
        <h4>필요한 부품</h4>
        ${match.required.map(part => `
          <div class="part">
            <span>${part.name} × ${part.quantity}</span>
            <span class="price">${part.totalPrice.toLocaleString()}원</span>
          </div>
        `).join("")}
        <button class="secondary" onclick="selectProject('${match.projectId}')">프로젝트 상세 보기</button>
      </div>
    `).join("");
  } catch (error) {
    container.innerHTML = `<div class="result"><p class="warning">${error.message}</p></div>`;
  }
}

// 프로젝트 부품
async function loadProject() {
  const id = document.getElementById("projectSelect").value;

  if (!id) return;

  const container = document.getElementById("projectParts");

  try {
    const project = await requestJson(`/api/projects/${id}`);

    container.innerHTML = `
      <h3>${project.name}</h3>
      <p>
        예상 전체 부품 비용:
        <strong>${project.totalCost.toLocaleString()}원</strong>
      </p>
    `;

    project.required.forEach(part => {
      const div = document.createElement("div");
      div.className = "part";

      div.innerHTML = `
        <span>${part.name} × ${part.quantity}</span>
        <span class="price">${part.totalPrice.toLocaleString()}원</span>
      `;

      container.appendChild(div);
    });
  } catch (error) {
    container.innerHTML = `<div class="result"><p class="warning">${error.message}</p></div>`;
  }
}

// 호환성 검사
async function checkCompatibility() {
  const partA = document.getElementById("partA").value;
  const partB = document.getElementById("partB").value;

  const container = document.getElementById("compatibilityResult");

  try {
    const result = await requestJson("/api/compatibility", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        partAId: partA,
        partBId: partB
      })
    });

  let html = `
    <div class="result">
      <h3>${result.partA} ↔ ${result.partB}</h3>
      <p class="${result.compatible ? "good" : "bad"}">
        ${result.compatible ? "🟢 호환 가능" : "🔴 호환 불가"}
      </p>
  `;

  result.checks.forEach(check => {
    html += `
      <p>
        <strong>${check.category}</strong> :
        ${check.result}
      </p>
    `;
  });

  result.warnings.forEach(warning => {
    html += `
      <p class="warning">⚠️ ${warning}</p>
    `;
  });

  html += "</div>";
    container.innerHTML = html;
  } catch (error) {
    container.innerHTML = `<div class="result"><p class="warning">${error.message}</p></div>`;
  }
}

// 구매처
async function buyPart() {
  const id = document.getElementById("buyPart").value;

  const container = document.getElementById("buyResult");

  try {
    const result = await requestJson(`/api/buy/${id}`);

    container.innerHTML = `
      <div class="result">
        <h3>${result.part}</h3>
        <p>
          예상 가격:
          <strong>${result.estimatedPrice.toLocaleString()}원</strong>
        </p>

        ${result.stores.map(store => `
          <a
            class="store-link"
            href="${store.searchUrl}"
            target="_blank"
            rel="noopener noreferrer"
          >
            🛒 ${store.store}에서 검색
          </a>
        `).join("")}
      </div>
    `;
  } catch (error) {
    container.innerHTML = `<div class="result"><p class="warning">${error.message}</p></div>`;
  }
}

// 스크롤
function scrollToSection(id) {
  document
    .getElementById(id)
    .scrollIntoView({
      behavior: "smooth"
    });
}

// 실행
loadData();
