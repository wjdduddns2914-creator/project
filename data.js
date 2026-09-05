const parts = [
  {
    id: "arduino-uno",
    name: "Arduino Uno",
    category: "controller",
    price: 28000,
    voltageMin: 5,
    voltageMax: 5,
    currentMax: 0.2,
    interface: ["digital", "analog", "i2c", "spi", "uart"],
    shaftDiameter: null,
    description: "대표적인 Arduino 개발 보드"
  },
  {
    id: "arduino-nano",
    name: "Arduino Nano",
    category: "controller",
    price: 12000,
    voltageMin: 5,
    voltageMax: 5,
    currentMax: 0.2,
    interface: ["digital", "analog", "i2c", "spi", "uart"],
    shaftDiameter: null,
    description: "소형 Arduino 개발 보드"
  },
  {
    id: "hc-sr04",
    name: "HC-SR04 초음파 센서",
    category: "sensor",
    price: 2500,
    voltageMin: 5,
    voltageMax: 5,
    currentMax: 0.015,
    interface: ["digital"],
    shaftDiameter: null,
    description: "거리 측정용 초음파 센서"
  },
  {
    id: "ir-sensor",
    name: "적외선 라인 센서",
    category: "sensor",
    price: 1800,
    voltageMin: 3.3,
    voltageMax: 5,
    currentMax: 0.02,
    interface: ["digital"],
    shaftDiameter: null,
    description: "라인트레이서 등에 사용하는 센서"
  },
  {
    id: "dc-motor",
    name: "DC 기어모터",
    category: "motor",
    price: 6500,
    voltageMin: 3,
    voltageMax: 9,
    currentMax: 1.5,
    interface: ["motor"],
    shaftDiameter: 3,
    description: "소형 로봇 구동용 DC 모터"
  },
  {
    id: "l298n",
    name: "L298N 모터 드라이버",
    category: "motor-driver",
    price: 4500,
    voltageMin: 5,
    voltageMax: 35,
    currentMax: 2,
    interface: ["motor"],
    shaftDiameter: null,
    description: "DC 모터 2개 제어 가능"
  },
  {
    id: "tb6612",
    name: "TB6612FNG 모터 드라이버",
    category: "motor-driver",
    price: 6500,
    voltageMin: 4.5,
    voltageMax: 13.5,
    currentMax: 1.2,
    interface: ["motor"],
    shaftDiameter: null,
    description: "소형 로봇에 적합한 모터 드라이버"
  },
  {
    id: "sg90",
    name: "SG90 서보모터",
    category: "servo",
    price: 3500,
    voltageMin: 4.8,
    voltageMax: 6,
    currentMax: 0.7,
    interface: ["pwm"],
    shaftDiameter: null,
    description: "소형 로봇팔 등에 사용하는 서보모터"
  },
  {
    id: "battery-74",
    name: "7.4V 배터리팩",
    category: "battery",
    price: 15000,
    voltageMin: 7.4,
    voltageMax: 7.4,
    currentMax: 5,
    interface: ["power"],
    shaftDiameter: null,
    description: "소형 로봇 및 모터 프로젝트용 배터리"
  },
  {
    id: "breadboard",
    name: "브레드보드",
    category: "tool",
    price: 3000,
    voltageMin: null,
    voltageMax: null,
    currentMax: null,
    interface: ["prototype"],
    shaftDiameter: null,
    description: "회로 프로토타이핑용"
  },
  {
    id: "chassis",
    name: "2WD 로봇 섀시",
    category: "mechanical",
    price: 8500,
    voltageMin: null,
    voltageMax: null,
    currentMax: null,
    interface: ["mechanical"],
    shaftDiameter: 3,
    description: "2륜 로봇 제작용 섀시"
  },
  {
    id: "wheel-65",
    name: "65mm 로봇 바퀴",
    category: "mechanical",
    price: 3000,
    voltageMin: null,
    voltageMax: null,
    currentMax: null,
    interface: ["mechanical"],
    shaftDiameter: 3,
    description: "DC 기어모터용 로봇 바퀴"
  }
];

const projects = [
  {
    id: "line-tracer",
    name: "라인트레이서",
    description: "적외선 센서를 이용해 검은 선을 따라 이동하는 로봇",
    sdgs: ["SDG 9", "SDG 12"],
    requiredParts: [
      { id: "arduino-nano", quantity: 1 },
      { id: "ir-sensor", quantity: 2 },
      { id: "dc-motor", quantity: 2 },
      { id: "l298n", quantity: 1 },
      { id: "battery-74", quantity: 1 },
      { id: "chassis", quantity: 1 },
      { id: "wheel-65", quantity: 2 }
    ]
  },
  {
    id: "obstacle-car",
    name: "장애물 회피 자동차",
    description: "초음파 센서를 이용해 장애물을 감지하고 회피하는 로봇",
    sdgs: ["SDG 9", "SDG 12"],
    requiredParts: [
      { id: "arduino-nano", quantity: 1 },
      { id: "hc-sr04", quantity: 1 },
      { id: "dc-motor", quantity: 2 },
      { id: "l298n", quantity: 1 },
      { id: "battery-74", quantity: 1 },
      { id: "chassis", quantity: 1 },
      { id: "wheel-65", quantity: 2 }
    ]
  },
  {
    id: "robot-arm",
    name: "소형 로봇팔",
    description: "서보모터를 이용해 물체를 움직이는 로봇팔",
    sdgs: ["SDG 9", "SDG 12"],
    requiredParts: [
      { id: "arduino-uno", quantity: 1 },
      { id: "sg90", quantity: 3 },
      { id: "breadboard", quantity: 1 },
      { id: "battery-74", quantity: 1 }
    ]
  },
  {
    id: "smart-window",
    name: "자동 환기 시스템",
    description: "센서와 모터를 이용해 창문을 자동으로 제어하는 시스템",
    sdgs: ["SDG 7", "SDG 9", "SDG 12"],
    requiredParts: [
      { id: "arduino-uno", quantity: 1 },
      { id: "hc-sr04", quantity: 1 },
      { id: "sg90", quantity: 1 },
      { id: "breadboard", quantity: 1 }
    ]
  }
];

const stores = [
  {
    name: "디바이스마트",
    url: "https://www.devicemart.co.kr/",
    searchUrl: "https://www.devicemart.co.kr/search?query="
  },
  {
    name: "아이씨뱅큐",
    url: "https://www.icbanq.com/",
    searchUrl: "https://www.icbanq.com/search?query="
  },
  {
    name: "메카솔루션",
    url: "https://mechasolution.com/",
    searchUrl: "https://mechasolution.com/search?q="
  }
];

module.exports = {
  parts,
  projects,
  stores
};