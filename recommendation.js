const { parts } = require("./data");


// =====================================================
// 키워드 → 필요한 기능
// =====================================================

const rules = [

  {
    keywords: [
      "장애물",
      "충돌",
      "피하는",
      "피해서",
      "회피",
      "거리"
    ],

    functions: [
      "장애물 감지",
      "거리 측정",
      "자동 회피"
    ],

    parts: [
      {
        id: "hc-sr04",
        quantity: 1
      }
    ]
  },


  {
    keywords: [
      "라인",
      "선 따라",
      "검은 선",
      "라인트레이서"
    ],

    functions: [
      "라인 감지",
      "방향 제어",
      "자동 주행"
    ],

    parts: [
      {
        id: "ir-sensor",
        quantity: 2
      }
    ]
  },


  {
    keywords: [
      "움직",
      "이동",
      "자동차",
      "차",
      "로봇",
      "주행"
    ],

    functions: [
      "이동",
      "속도 제어"
    ],

    parts: [
      {
        id: "dc-motor",
        quantity: 2
      },
      {
        id: "l298n",
        quantity: 1
      },
      {
        id: "chassis",
        quantity: 1
      },
      {
        id: "wheel-65",
        quantity: 2
      }
    ]
  },


  {
    keywords: [
      "회전",
      "각도",
      "관절",
      "로봇팔",
      "집게",
      "잡는"
    ],

    functions: [
      "회전 제어",
      "각도 제어"
    ],

    parts: [
      {
        id: "sg90",
        quantity: 2
      }
    ]
  },


  {
    keywords: [
      "강한",
      "무거운",
      "높은 토크",
      "고토크"
    ],

    functions: [
      "고토크 구동"
    ],

    parts: [
      {
        id: "servo-mg996r",
        quantity: 1
      }
    ]
  },


  {
    keywords: [
      "화분",
      "식물",
      "물",
      "급수",
      "물을 주",
      "자동 물"
    ],

    functions: [
      "식물 관리",
      "자동 급수",
      "수분 상태 확인"
    ],

    parts: []
  },


  {
    keywords: [
      "온도",
      "더운",
      "뜨거운",
      "열"
    ],

    functions: [
      "온도 측정"
    ],

    parts: []
  },


  {
    keywords: [
      "화면",
      "디스플레이",
      "표시",
      "보여주"
    ],

    functions: [
      "정보 표시"
    ],

    parts: [
      {
        id: "oled",
        quantity: 1
      }
    ]
  },


  {
    keywords: [
      "소리",
      "알림",
      "경고음",
      "삐"
    ],

    functions: [
      "소리 알림"
    ],

    parts: [
      {
        id: "buzzer",
        quantity: 1
      }
    ]
  },


  {
    keywords: [
      "센서",
      "측정",
      "감지"
    ],

    functions: [
      "환경 또는 물체 감지"
    ],

    parts: []
  }

];


// =====================================================
// 기본적으로 필요한 제어부
// =====================================================

function addBasicController(text, recommended) {

  const controllerExists =
    recommended.some(
      item =>
        item.id === "arduino-uno" ||
        item.id === "arduino-nano"
    );


  if (!controllerExists) {

    recommended.push({

      id: "arduino-nano",

      quantity: 1,

      reason:
        "센서 입력을 처리하고 전체 장치를 제어하기 위해 필요합니다."

    });

  }

}


// =====================================================
// 전원 추가
// =====================================================

function addPower(text, recommended) {

  const needsPower =
    recommended.some(
      item =>
        [
          "dc-motor",
          "sg90",
          "servo-mg996r"
        ].includes(item.id)
    );


  const batteryExists =
    recommended.some(
      item =>
        item.id === "battery-74"
    );


  if (
    needsPower &&
    !batteryExists
  ) {

    recommended.push({

      id: "battery-74",

      quantity: 1,

      reason:
        "모터와 제어 회로에 전원을 공급하기 위해 필요합니다."

    });

  }

}


// =====================================================
// 추천 엔진
// =====================================================

function recommendDevice({
  device = "",
  purpose = "",
  functions = "",
  budget = "",
  ownedParts = []
}) {

  const text = (
    device +
    " " +
    purpose +
    " " +
    functions
  ).toLowerCase();


  const recommended = [];

  const detectedFunctions = [];

  let score = 0;


  // -------------------------------------------------
  // 키워드 분석
  // -------------------------------------------------

  rules.forEach(rule => {

    const matched =
      rule.keywords.some(
        keyword =>
          text.includes(
            keyword.toLowerCase()
          )
      );


    if (!matched) {
      return;
    }


    score++;


    rule.functions.forEach(
      func => {

        if (
          !detectedFunctions.includes(
            func
          )
        ) {

          detectedFunctions.push(
            func
          );

        }

      }
    );


    rule.parts.forEach(
      part => {

        const existing =
          recommended.find(
            item =>
              item.id ===
              part.id
          );


        if (existing) {

          existing.quantity =
            Math.max(
              existing.quantity,
              part.quantity
            );

        } else {

          recommended.push({

            id:
              part.id,

            quantity:
              part.quantity,

            reason:
              getPartReason(
                part.id
              )

          });

        }

      }
    );

  });


  // -------------------------------------------------
  // 이동 장치
  // -------------------------------------------------

  const movementKeywords = [
    "자동차",
    "차",
    "로봇",
    "이동",
    "주행",
    "움직"
  ];


  const needsMovement =
    movementKeywords.some(
      keyword =>
        text.includes(
          keyword
        )
    );


  // -------------------------------------------------
  // 제어부
  // -------------------------------------------------

  if (
    score > 0 ||
    needsMovement
  ) {

    addBasicController(
      text,
      recommended
    );

  }


  // -------------------------------------------------
  // 이동 장치
  // -------------------------------------------------

  if (
    needsMovement &&
    !recommended.some(
      item =>
        item.id ===
        "dc-motor"
    )
  ) {

    recommended.push({

      id:
        "dc-motor",

      quantity:
        2,

      reason:
        "장치를 실제로 이동시키기 위한 구동부입니다."

    });


    recommended.push({

      id:
        "l298n",

      quantity:
        1,

      reason:
        "Arduino에서 DC 모터의 방향과 속도를 제어하기 위해 필요합니다."

    });


    recommended.push({

      id:
        "chassis",

      quantity:
        1,

      reason:
        "모터와 전자부품을 장착할 기계적 구조입니다."

    });


    recommended.push({

      id:
        "wheel-65",

      quantity:
        2,

      reason:
        "DC 기어모터의 회전력을 이동으로 변환합니다."

    });

  }


  // -------------------------------------------------
  // 전원
  // -------------------------------------------------

  addPower(
    text,
    recommended
  );


  // -------------------------------------------------
  // 예산 분석
  // -------------------------------------------------

  const budgetNumber =
    parseBudget(
      budget
    );


  // -------------------------------------------------
  // DB와 연결
  // -------------------------------------------------

  const resultParts =
    recommended.map(
      item => {

        const databasePart =
          parts.find(
            part =>
              part.id ===
              item.id
          );


        if (!databasePart) {

          return {

            name:
              item.id,

            quantity:
              item.quantity,

            status:
              "추가 부품 필요",

            estimatedPrice:
              0,

            reason:
              item.reason,

            databaseId:
              null

          };

        }


        const isOwned =
          ownedParts.some(
            owned =>
              owned
                .toLowerCase()
                .includes(
                  databasePart.name
                    .toLowerCase()
                ) ||
              databasePart.name
                .toLowerCase()
                .includes(
                  owned.toLowerCase()
                )
          );


        return {

          name:
            databasePart.name,

          quantity:
            item.quantity,

          status:
            isOwned
              ? "보유"
              : "구매 필요",

          estimatedPrice:
            databasePart.price,

          reason:
            item.reason,

          databaseId:
            databasePart.id

        };

      }
    );


  // -------------------------------------------------
  // 예상 가격
  // -------------------------------------------------

  const estimatedCost =
    resultParts.reduce(
      (
        total,
        item
      ) => {

        if (
          item.status ===
          "보유"
        ) {

          return total;

        }


        return (
          total +
          item.estimatedPrice *
          item.quantity
        );

      },

      0
    );


  // -------------------------------------------------
  // 난이도
  // -------------------------------------------------

  let difficulty =
    "초급";


  if (
    detectedFunctions.length >= 3
  ) {

    difficulty =
      "중급";

  }


  if (
    detectedFunctions.length >= 5
  ) {

    difficulty =
      "고급";

  }


  // -------------------------------------------------
  // 결과
  // -------------------------------------------------

  return {

    deviceName:
      device,

    summary:
      generateSummary(
        device,
        detectedFunctions
      ),

    difficulty,

    estimatedCost,

    detectedFunctions,

    parts:
      resultParts,

    existingParts:
      resultParts
        .filter(
          item =>
            item.status ===
            "보유"
        )
        .map(
          item =>
            item.name
        ),

    additionalParts:
      resultParts
        .filter(
          item =>
            item.status !==
            "보유"
        )
        .map(
          item =>
            item.name
        ),

    connections:
      generateConnections(
        resultParts
      ),

    operation:
      generateOperation(
        detectedFunctions
      ),

    developmentTips:
      generateTips(
        detectedFunctions
      ),

    budget:
      budgetNumber,

    confidence:
      calculateConfidence(
        score,
        recommended.length
      )

  };

}


// =====================================================
// 부품 설명
// =====================================================

function getPartReason(
  id
) {

  const reasons = {

    "arduino-uno":
      "센서와 구동부를 제어하는 메인 컨트롤러입니다.",

    "arduino-nano":
      "소형 장치의 센서와 모터를 제어하는 컨트롤러입니다.",

    "hc-sr04":
      "초음파를 이용하여 물체까지의 거리를 측정합니다.",

    "ir-sensor":
      "적외선을 이용하여 선이나 물체를 감지합니다.",

    "dc-motor":
      "장치를 실제로 움직이는 구동부입니다.",

    "l298n":
      "Arduino에서 DC 모터를 제어하기 위한 모터 드라이버입니다.",

    "tb6612":
      "DC 모터의 방향과 속도를 제어하는 모터 드라이버입니다.",

    "sg90":
      "작은 기계 구조물의 각도와 위치를 제어합니다.",

    "servo-mg996r":
      "높은 토크가 필요한 기계 구조물을 움직입니다.",

    "battery-74":
      "프로젝트에 전원을 공급합니다.",

    "breadboard":
      "회로를 쉽게 연결하고 테스트하기 위해 사용합니다.",

    "chassis":
      "모터와 회로를 고정하는 기계적 구조입니다.",

    "wheel-65":
      "모터의 회전을 바퀴의 이동으로 변환합니다.",

    "oled":
      "센서값과 장치 상태를 화면에 표시합니다.",

    "buzzer":
      "경고나 상태를 소리로 알려줍니다."

  };


  return (
    reasons[id] ||
    "프로젝트의 기능을 구현하기 위해 필요한 부품입니다."
  );

}


// =====================================================
// 요약 생성
// =====================================================

function generateSummary(
  device,
  functions
) {

  if (
    functions.length === 0
  ) {

    return `${device}의 기능을 정확하게 분석하기 위해 입력한 설명을 기반으로 기본적인 제어 시스템 구성을 추천했습니다.`;

  }


  return `${device}는 ${functions.join(
    ", "
  )} 기능을 중심으로 설계할 수 있습니다. 입력된 기능을 분석하여 센서, 제어부, 구동부 및 전원부를 구성했습니다.`;

}


// =====================================================
// 연결 구조
// =====================================================

function generateConnections(
  resultParts
) {

  const connections = [];


  const controller =
    resultParts.find(
      part =>
        part.databaseId ===
          "arduino-uno" ||
        part.databaseId ===
          "arduino-nano"
    );


  if (controller) {

    resultParts
      .filter(
        part =>
          part.databaseId !==
            controller.databaseId &&
          ![
            "battery-74",
            "chassis",
            "wheel-65"
          ].includes(
            part.databaseId
          )
      )
      .forEach(
        part => {

          connections.push({

            from:
              controller.name,

            to:
              part.name,

            description:
              "센서 또는 출력장치를 Arduino의 적절한 제어 핀에 연결합니다."

          });

        }
      );

  }


  return connections;

}


// =====================================================
// 작동 과정
// =====================================================

function generateOperation(
  functions
) {

  const operation = [

    "전원을 공급하고 Arduino가 시스템을 초기화합니다.",

    "센서가 주변 환경 또는 대상의 상태를 측정합니다.",

    "Arduino가 센서 데이터를 분석합니다.",

    "분석 결과에 따라 구동부 또는 출력장치를 제어합니다."

  ];


  if (
    functions.includes(
      "장애물 감지"
    )
  ) {

    operation.push(
      "장애물이 감지되면 모터의 방향을 변경하여 회피합니다."
    );

  }


  if (
    functions.includes(
      "라인 감지"
    )
  ) {

    operation.push(
      "좌우 센서의 값을 비교하여 이동 방향을 조정합니다."
    );

  }


  if (
    functions.includes(
      "각도 제어"
    )
  ) {

    operation.push(
      "Arduino가 서보모터의 목표 각도를 제어합니다."
    );

  }


  return operation;

}


// =====================================================
// 개발 팁
// =====================================================

function generateTips(
  functions
) {

  const tips = [

    "처음 제작할 때는 모든 부품을 한꺼번에 연결하지 말고 기능별로 테스트하는 것이 좋습니다.",

    "모터와 센서의 전원 요구사항을 실제 부품 사양과 비교해야 합니다.",

    "프로토타입 제작 후 센서의 측정값을 확인하면서 제어 조건을 조정할 수 있습니다."

  ];


  if (
    functions.includes(
      "장애물 감지"
    )
  ) {

    tips.push(
      "초음파 센서의 측정값에 여러 번의 샘플링을 적용하면 순간적인 오차를 줄일 수 있습니다."
    );

  }


  if (
    functions.includes(
      "라인 감지"
    )
  ) {

    tips.push(
      "라인 센서의 감도와 센서 간격을 조정하면 주행 안정성을 높일 수 있습니다."
    );

  }


  return tips;

}


// =====================================================
// 예산 숫자 추출
// =====================================================

function parseBudget(
  budget
) {

  if (!budget) {

    return null;

  }


  const match =
    budget
      .replace(
        /,/g,
        ""
      )
      .match(
        /(\d+)\s*(만|천)?/
      );


  if (!match) {

    return null;

  }


  const number =
    Number(
      match[1]
    );


  if (
    match[2] ===
    "만"
  ) {

    return number * 10000;

  }


  if (
    match[2] ===
    "천"
  ) {

    return number * 1000;

  }


  return number;

}


// =====================================================
// 추천 신뢰도
// =====================================================

function calculateConfidence(
  score,
  partCount
) {

  let confidence =
    45;


  confidence +=
    score * 8;


  if (
    partCount >= 3
  ) {

    confidence += 10;

  }


  if (
    confidence > 95
  ) {

    confidence = 95;

  }


  return confidence;

}


module.exports = {
  recommendDevice
};