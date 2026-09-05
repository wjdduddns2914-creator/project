const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// public 폴더의 HTML/CSS/JS 사용
app.use(express.static(path.join(__dirname, "public")));

const { parts, projects, stores } = require("./data");

// 서버와 API 상태 확인
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    service: "MakerMatch API",
    version: "1.1.0"
  });
});

// ================================
// 전체 부품
// ================================
app.get("/api/parts", (req, res) => {
  res.json(parts);
});

// ================================
// 전체 프로젝트
// ================================
app.get("/api/projects", (req, res) => {
  res.json(projects);
});

// ================================
// 프로젝트 상세
// ================================
app.get("/api/projects/:id", (req, res) => {
  const project = projects.find(
    p => p.id === req.params.id
  );

  if (!project) {
    return res.status(404).json({
      error: "프로젝트를 찾을 수 없습니다."
    });
  }

  const required = project.requiredParts.map(item => {
    const part = parts.find(
      p => p.id === item.id
    );

    return {
      ...part,
      quantity: item.quantity,
      totalPrice: part.price * item.quantity
    };
  });

  const totalCost = required.reduce(
    (sum, part) => sum + part.totalPrice,
    0
  );

  res.json({
    ...project,
    required,
    totalCost
  });
});

// 사용자가 입력한 기기와 가까운 제작 프로젝트 추천
app.post("/api/device-plan", (req, res) => {
  const device = String(req.body.device || "").trim();

  if (!device) {
    return res.status(400).json({
      error: "수리하거나 제작하려는 기기 이름을 입력해 주세요."
    });
  }

  const normalizedDevice = device.toLowerCase();
  const aliases = {
    로봇: ["라인트레이서", "장애물 회피 자동차", "소형 로봇팔"],
    자동차: ["장애물 회피 자동차", "라인트레이서"],
    창문: ["자동 환기 시스템"],
    환기: ["자동 환기 시스템"],
    센서: ["라인트레이서", "장애물 회피 자동차", "자동 환기 시스템"]
  };

  const matches = projects
    .map(project => {
      const projectText = [
        project.name,
        project.description,
        ...project.requiredParts.map(item => {
          const part = parts.find(p => p.id === item.id);
          return part ? `${part.name} ${part.category} ${part.description}` : "";
        })
      ].join(" ").toLowerCase();

      let score = projectText.includes(normalizedDevice) ? 3 : 0;
      const relatedProjects = aliases[normalizedDevice] || [];

      if (relatedProjects.includes(project.name)) {
        score += 2;
      }

      normalizedDevice
        .split(/\s+/)
        .filter(Boolean)
        .forEach(keyword => {
          if (keyword.length > 1 && projectText.includes(keyword)) {
            score += 1;
          }
        });

      return { project, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ project }) => {
      const required = project.requiredParts.map(item => {
        const part = parts.find(p => p.id === item.id);
        return {
          id: part.id,
          name: part.name,
          quantity: item.quantity,
          price: part.price,
          totalPrice: part.price * item.quantity,
          reason: part.description
        };
      });

      return {
        projectId: project.id,
        projectName: project.name,
        description: project.description,
        required,
        totalCost: required.reduce((sum, item) => sum + item.totalPrice, 0)
      };
    });

  res.json({
    device,
    matches,
    message: matches.length
      ? "입력한 기기와 관련된 제작 계획입니다."
      : "등록된 데이터에서 관련 기기를 찾지 못했습니다. 다른 이름이나 핵심 부품을 입력해 보세요."
  });
});

// ================================
// 보유 부품 기준 프로젝트 추천
// ================================
app.post("/api/recommend-projects", (req, res) => {
  const ownedParts = req.body.ownedParts || [];

  const results = projects.map(project => {
    let ownedCount = 0;
    let requiredCount = 0;

    project.requiredParts.forEach(required => {
      const owned = ownedParts.find(
        p => p.id === required.id
      );

      requiredCount += required.quantity;

      if (owned) {
        ownedCount += Math.min(
          owned.quantity,
          required.quantity
        );
      }
    });

    const readiness =
      requiredCount === 0
        ? 0
        : Math.round(
            (ownedCount / requiredCount) * 100
          );

    return {
      projectId: project.id,
      projectName: project.name,
      readiness,
      missingParts: project.requiredParts
        .filter(required => {
          const owned = ownedParts.find(
            p => p.id === required.id
          );

          return (
            !owned ||
            owned.quantity < required.quantity
          );
        })
        .map(required => {
          const part = parts.find(
            p => p.id === required.id
          );

          const owned = ownedParts.find(
            p => p.id === required.id
          );

          const ownedQuantity = owned
            ? owned.quantity
            : 0;

          return {
            name: part.name,
            quantity:
              required.quantity - ownedQuantity
          };
        })
    };
  });

  results.sort(
    (a, b) => b.readiness - a.readiness
  );

  res.json(results);
});

// ================================
// 호환성 검사
// ================================
app.post("/api/compatibility", (req, res) => {
  const {
    partAId,
    partBId
  } = req.body;

  const partA = parts.find(
    p => p.id === partAId
  );

  const partB = parts.find(
    p => p.id === partBId
  );

  if (!partA || !partB) {
    return res.status(404).json({
      error: "부품을 찾을 수 없습니다."
    });
  }

  const warnings = [];
  const checks = [];

  // 전압 검사
  if (
    partA.voltageMin !== null &&
    partB.voltageMin !== null
  ) {
    const overlap =
      Math.max(
        partA.voltageMin,
        partB.voltageMin
      ) <=
      Math.min(
        partA.voltageMax,
        partB.voltageMax
      );

    checks.push({
      category: "전압",
      result: overlap
        ? "PASS"
        : "FAIL"
    });

    if (!overlap) {
      warnings.push(
        `전압 범위가 맞지 않습니다. ${partA.name}: ${partA.voltageMin}-${partA.voltageMax}V / ${partB.name}: ${partB.voltageMin}-${partB.voltageMax}V`
      );
    }
  }

  // 전류 검사
  if (
    partA.currentMax !== null &&
    partB.currentMax !== null
  ) {
    const maxCurrent =
      Math.min(
        partA.currentMax,
        partB.currentMax
      );

    checks.push({
      category: "전류",
      result: "PASS",
      availableCurrent:
        `${maxCurrent}A`
    });
  }

  // 인터페이스 검사
  const interfaceMatch =
    partA.interface.some(
      value =>
        partB.interface.includes(value)
    );

  checks.push({
    category: "인터페이스",
    result: interfaceMatch
      ? "PASS"
      : "CHECK"
  });

  if (!interfaceMatch) {
    warnings.push(
      "직접 연결 가능한 공통 인터페이스가 없습니다."
    );
  }

  // 기계적 호환성
  if (
    partA.shaftDiameter !== null &&
    partB.shaftDiameter !== null
  ) {
    const mechanicalMatch =
      partA.shaftDiameter ===
      partB.shaftDiameter;

    checks.push({
      category: "기계적 규격",
      result: mechanicalMatch
        ? "PASS"
        : "FAIL"
    });

    if (!mechanicalMatch) {
      warnings.push(
        `축 직경이 다릅니다. ${partA.shaftDiameter}mm vs ${partB.shaftDiameter}mm`
      );
    }
  }

  const compatible =
    !checks.some(
      check =>
        check.result === "FAIL"
    );

  res.json({
    compatible,
    status: compatible
      ? "COMPATIBLE"
      : "INCOMPATIBLE",
    partA: partA.name,
    partB: partB.name,
    checks,
    warnings
  });
});

// ================================
// 구매 추천
// ================================
app.get("/api/buy/:partId", (req, res) => {
  const part = parts.find(
    p => p.id === req.params.partId
  );

  if (!part) {
    return res.status(404).json({
      error: "부품을 찾을 수 없습니다."
    });
  }

  const results = stores.map(store => ({
    store: store.name,
    product: part.name,
    price: part.price,
    searchUrl:
      store.searchUrl +
      encodeURIComponent(part.name)
  }));

  res.json({
    part: part.name,
    estimatedPrice: part.price,
    stores: results
  });
});

// ================================
// 프로젝트 추가 비용 계산
// ================================
app.post("/api/calculate-cost", (req, res) => {
  const {
    projectId,
    ownedParts = []
  } = req.body;

  const project = projects.find(
    p => p.id === projectId
  );

  if (!project) {
    return res.status(404).json({
      error: "프로젝트를 찾을 수 없습니다."
    });
  }

  let additionalCost = 0;
  const missingParts = [];

  project.requiredParts.forEach(
    required => {
      const part = parts.find(
        p => p.id === required.id
      );

      const owned = ownedParts.find(
        p => p.id === required.id
      );

      const ownedQuantity = owned
        ? owned.quantity
        : 0;

      const missingQuantity =
        Math.max(
          0,
          required.quantity -
            ownedQuantity
        );

      if (missingQuantity > 0) {
        const cost =
          part.price *
          missingQuantity;

        additionalCost += cost;

        missingParts.push({
          name: part.name,
          quantity: missingQuantity,
          price: part.price,
          total: cost
        });
      }
    }
  );

  res.json({
    project: project.name,
    additionalCost,
    missingParts
  });
});

// ================================
// 서버 실행
// ================================
app.listen(PORT, () => {
  console.log(
    `MakerMatch server running on port ${PORT}`
  );
});

app.use((err, req, res, next) => {
  console.error("API error:", err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(500).json({
    error: "서버에서 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요."
  });
});