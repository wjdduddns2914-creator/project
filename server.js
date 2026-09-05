const express = require("express");
const path = require("path");

const {
  parts,
  projects,
  stores
} = require("./data");

const {
  recommendDevice
} = require("./recommendation");


const app = express();

const PORT =
  process.env.PORT || 3000;


app.use(
  express.json()
);


app.use(
  express.static(
    path.join(
      __dirname,
      "public"
    )
  )
);


// =====================================================
// 부품
// =====================================================

app.get(
  "/api/parts",
  (req, res) => {

    res.json(parts);

  }
);


// =====================================================
// 프로젝트
// =====================================================

app.get(
  "/api/projects",
  (req, res) => {

    res.json(projects);

  }
);


// =====================================================
// 프로젝트 상세
// =====================================================

app.get(
  "/api/projects/:id",
  (req, res) => {

    const project =
      projects.find(
        p =>
          p.id ===
          req.params.id
      );


    if (!project) {

      return res
        .status(404)
        .json({
          error:
            "프로젝트를 찾을 수 없습니다."
        });

    }


    const required =
      project.requiredParts.map(
        item => {

          const part =
            parts.find(
              p =>
                p.id ===
                item.id
            );


          return {

            ...part,

            quantity:
              item.quantity,

            totalPrice:
              part.price *
              item.quantity

          };

        }
      );


    const totalCost =
      required.reduce(
        (
          sum,
          part
        ) =>
          sum +
          part.totalPrice,

        0
      );


    res.json({

      ...project,

      required,

      totalCost

    });

  }
);


// =====================================================
// 호환성 검사
// =====================================================

app.post(
  "/api/compatibility",
  (req, res) => {

    const {
      partAId,
      partBId
    } = req.body;


    const partA =
      parts.find(
        p =>
          p.id ===
          partAId
      );


    const partB =
      parts.find(
        p =>
          p.id ===
          partBId
      );


    if (
      !partA ||
      !partB
    ) {

      return res
        .status(404)
        .json({
          error:
            "부품을 찾을 수 없습니다."
        });

    }


    const warnings = [];

    const checks = [];


    // 전압
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

        category:
          "전압",

        result:
          overlap
            ? "PASS"
            : "FAIL"

      });


      if (!overlap) {

        warnings.push(
          "두 부품의 전압 범위를 확인해야 합니다."
        );

      }

    }


    // 인터페이스
    const interfaceMatch =
      partA.interface.some(
        value =>
          partB.interface.includes(
            value
          )
      );


    checks.push({

      category:
        "인터페이스",

      result:
        interfaceMatch
          ? "PASS"
          : "CHECK"

    });


    if (
      !interfaceMatch
    ) {

      warnings.push(
        "직접 연결 가능한 공통 인터페이스가 없습니다."
      );

    }


    const compatible =
      !checks.some(
        check =>
          check.result ===
          "FAIL"
      );


    res.json({

      compatible,

      partA:
        partA.name,

      partB:
        partB.name,

      checks,

      warnings

    });

  }
);


// =====================================================
// 구매처
// =====================================================

app.get(
  "/api/buy/:partId",
  (req, res) => {

    const part =
      parts.find(
        p =>
          p.id ===
          req.params.partId
      );


    if (!part) {

      return res
        .status(404)
        .json({
          error:
            "부품을 찾을 수 없습니다."
        });

    }


    const results =
      stores.map(
        store => ({

          store:
            store.name,

          product:
            part.name,

          price:
            part.price,

          searchUrl:
            store.searchUrl +
            encodeURIComponent(
              part.name
            )

        })
      );


    res.json({

      part:
        part.name,

      estimatedPrice:
        part.price,

      stores:
        results

    });

  }
);


// =====================================================
// ⭐ 자체 AI 설계 엔진
// =====================================================

app.post(
  "/api/ai-design",
  (req, res) => {

    try {

      const result =
        recommendDevice(
          req.body
        );


      res.json(result);

    } catch (error) {

      console.error(
        "추천 엔진 오류:",
        error
      );


      res
        .status(500)
        .json({

          error:
            "기기 분석 중 오류가 발생했습니다.",

          details:
            error.message

        });

    }

  }
);


// =====================================================
// 서버
// =====================================================

app.listen(
  PORT,
  () => {

    console.log(
      `MakerMatch server running on port ${PORT}`
    );

    console.log(
      "Local AI recommendation engine enabled"
    );

  }
);