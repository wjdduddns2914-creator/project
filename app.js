function renderAIResult(result) {

  const container =
    document.getElementById(
      "aiResult"
    );


  const partsHTML =
    (result.parts || [])
      .map(
        part => {

          const owned =
            part.status ===
            "보유";


          return `

            <div class="ai-part">

              <div
                class="ai-part-header"
              >

                <span
                  class="ai-part-name"
                >

                  ${escapeHTML(
                    part.name
                  )}

                  ×

                  ${part.quantity}

                </span>


                <span
                  class="${
                    owned
                      ? "owned"
                      : "need"
                  }"
                >

                  ${
                    owned
                      ? "✓ 보유"
                      : "구매 필요"
                  }

                </span>

              </div>


              <p>

                ${escapeHTML(
                  part.reason
                )}

              </p>


              ${
                part.estimatedPrice
                  ? `

                    <small>

                      개당 예상 가격:
                      ${Number(
                        part.estimatedPrice
                      ).toLocaleString()}원

                    </small>

                  `
                  : ""
              }

            </div>

          `;

        }
      )
      .join("");


  const functionsHTML =
    (result.detectedFunctions || [])
      .map(
        item =>
          `<li>${escapeHTML(
            item
          )}</li>`
      )
      .join("");


  const operationHTML =
    (result.operation || [])
      .map(
        item =>
          `<li>${escapeHTML(
            item
          )}</li>`
      )
      .join("");


  const tipsHTML =
    (result.developmentTips || [])
      .map(
        item =>
          `<li>${escapeHTML(
            item
          )}</li>`
      )
      .join("");


  const connectionsHTML =
    (result.connections || [])
      .map(
        connection => `

          <div class="connection">

            <strong>

              ${escapeHTML(
                connection.from
              )}

              →

              ${escapeHTML(
                connection.to
              )}

            </strong>

            <br>

            ${escapeHTML(
              connection.description
            )}

          </div>

        `
      )
      .join("");


  container.innerHTML = `

    <h2>

      ${escapeHTML(
        result.deviceName ||
        "AI 설계 결과"
      )}

    </h2>


    <span class="difficulty">

      난이도:
      ${escapeHTML(
        result.difficulty
      )}

    </span>


    <div class="ai-summary">

      ${escapeHTML(
        result.summary
      )}

    </div>


    <div class="ai-cost">

      예상 추가 구매 비용:

      ${Number(
        result.estimatedCost
      ).toLocaleString()}원

    </div>


    <div class="ai-section">

      <h4>
        🔍 분석된 기능
      </h4>

      <ul class="ai-list">

        ${functionsHTML}

      </ul>

    </div>


    <div class="ai-section">

      <h4>
        🔧 필요한 부품
      </h4>

      ${partsHTML}

    </div>


    ${
      connectionsHTML
        ? `

          <div class="ai-section">

            <h4>
              🔌 주요 연결 구조
            </h4>

            ${connectionsHTML}

          </div>

        `
        : ""
    }


    <div class="ai-section">

      <h4>
        ⚙️ 작동 과정
      </h4>

      <ol class="ai-list">

        ${operationHTML}

      </ol>

    </div>


    <div class="ai-section">

      <h4>
        💡 제작 팁
      </h4>

      <ul class="ai-list">

        ${tipsHTML}

      </ul>

    </div>


    <div class="ai-section">

      <small>

        자체 분석 신뢰도:
        ${result.confidence}%

      </small>

    </div>

  `;

}
async function requestAIDesign() {

  const device =
    document.getElementById("aiDevice").value;

  const purpose =
    document.getElementById("aiPurpose").value;

  const functions =
    document.getElementById("aiFunctions").value;

  const budget =
    document.getElementById("aiBudget").value;

  const ownedParts =
    document.getElementById("aiOwnedParts").value;


  if (!device && !purpose && !functions) {

    alert("만들고 싶은 기기나 기능을 입력해주세요.");

    return;
  }


  const loading =
    document.getElementById("aiLoading");

  const result =
    document.getElementById("aiResult");


  loading.style.display = "block";

  result.innerHTML = "";


  try {

    const response =
      await fetch("/api/ai-design", {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          device,
          purpose,
          functions,
          budget,

          ownedParts:
            ownedParts
              .split(",")
              .map(item => item.trim())
              .filter(Boolean)

        })

      });


    const data =
      await response.json();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "분석에 실패했습니다."
      );

    }


    renderAIResult(data);


  } catch (error) {

    console.error(error);

    result.innerHTML = `

      <div class="error">

        ❌ 오류가 발생했습니다.

        <br><br>

        ${escapeHTML(
          error.message
        )}

      </div>

    `;

  } finally {

    loading.style.display = "none";

  }

}
function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text ?? "";

  return div.innerHTML;

}