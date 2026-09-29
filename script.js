// ======================================================
// ASTROPATH - STABLE MISSION VERSION
// Earth + selected destination pause during mission.
// Other planets continue orbiting.
// ======================================================


// ======================================================
// HTML ELEMENTS
// ======================================================

const solarSystem = document.getElementById("solarSystem");
const starsContainer = document.getElementById("stars");

const destinationSelect = document.getElementById("destination");
const launchButton = document.getElementById("launchButton");

const speedSlider = document.getElementById("speedSlider");
const speedValue = document.getElementById("speedValue");

const destinationData = document.getElementById("destinationData");
const distanceData = document.getElementById("distanceData");
const travelData = document.getElementById("travelData");
const positionData = document.getElementById("positionData");

const missionStatus = document.getElementById("missionStatus");
const missionProgress = document.getElementById("missionProgress");
const progressText = document.getElementById("progressText");

const rocket = document.getElementById("rocket");
const routeLine = document.getElementById("routeLine");
const missionPath = document.getElementById("missionPath");


// ======================================================
// PLANET DATA
// ======================================================

const planets = {

    mercury: {
        name: "Mercury",
        orbit: 85,
        size: 10,
        speed: 0.020,
        angle: 0.5,
        distanceFromSun: 57.9
    },

    venus: {
        name: "Venus",
        orbit: 125,
        size: 16,
        speed: 0.015,
        angle: 2.0,
        distanceFromSun: 108.2
    },

    earth: {
        name: "Earth",
        orbit: 170,
        size: 18,
        speed: 0.012,
        angle: 3.4,
        distanceFromSun: 149.6
    },

    mars: {
        name: "Mars",
        orbit: 215,
        size: 14,
        speed: 0.010,
        angle: 5.1,
        distanceFromSun: 227.9
    },

    jupiter: {
        name: "Jupiter",
        orbit: 270,
        size: 31,
        speed: 0.006,
        angle: 1.2,
        distanceFromSun: 778.5
    },

    saturn: {
        name: "Saturn",
        orbit: 310,
        size: 27,
        speed: 0.0045,
        angle: 4.1,
        distanceFromSun: 1434
    }
};


// ======================================================
// GLOBAL STATE
// ======================================================

let simulationSpeed = 1;

let missionRunning = false;

let activeDestinationKey = null;


// ======================================================
// CREATE STARS
// ======================================================

function createStars() {

    starsContainer.innerHTML = "";

    for (let i = 0; i < 130; i++) {

        const star = document.createElement("div");

        star.classList.add("star");

        const size = Math.random() * 2 + 0.5;

        star.style.width = `${size}px`;
        star.style.height = `${size}px`;

        star.style.left =
            `${Math.random() * 100}%`;

        star.style.top =
            `${Math.random() * 100}%`;

        star.style.opacity =
            (Math.random() * 0.6 + 0.2).toFixed(2);

        starsContainer.appendChild(star);
    }
}

createStars();


// ======================================================
// RESPONSIVE ORBIT SCALE
// ======================================================

function getOrbitScale() {

    const width = solarSystem.clientWidth;
    const height = solarSystem.clientHeight;

    const availableRadius =
        Math.min(width / 2, height / 2) - 30;

    return availableRadius / 325;
}


// ======================================================
// CREATE ORBITS AND PLANETS
// ======================================================

Object.keys(planets).forEach(key => {

    const planet = planets[key];


    // ORBIT

    const orbitElement =
        document.createElement("div");

    orbitElement.classList.add("orbit");

    solarSystem.appendChild(orbitElement);

    planet.orbitElement = orbitElement;


    // PLANET

    const planetElement =
        document.createElement("div");

    planetElement.classList.add(
        "planet",
        `planet-${key}`
    );

    planetElement.dataset.name =
        planet.name;

    planetElement.style.width =
        `${planet.size}px`;

    planetElement.style.height =
        `${planet.size}px`;

    solarSystem.appendChild(planetElement);

    planet.element = planetElement;
});


// ======================================================
// UPDATE ORBIT SIZES
// ======================================================

function updateOrbitSizes() {

    const scale = getOrbitScale();

    Object.values(planets).forEach(planet => {

        const radius =
            planet.orbit * scale;

        planet.displayOrbit = radius;

        planet.orbitElement.style.width =
            `${radius * 2}px`;

        planet.orbitElement.style.height =
            `${radius * 2 * 0.62}px`;
    });
}

updateOrbitSizes();


// ======================================================
// GET PLANET POSITION
// ======================================================

function getPlanetPosition(planet) {

    const centerX =
        solarSystem.clientWidth / 2;

    const centerY =
        solarSystem.clientHeight / 2;

    const radius =
        planet.displayOrbit || planet.orbit;

    return {

        x:
            centerX +
            Math.cos(planet.angle) *
            radius,

        y:
            centerY +
            Math.sin(planet.angle) *
            radius *
            0.62
    };
}


// ======================================================
// DRAW PLANETS
// ======================================================

function updatePlanetPositions() {

    Object.values(planets).forEach(planet => {

        const position =
            getPlanetPosition(planet);

        planet.element.style.left =
            `${position.x}px`;

        planet.element.style.top =
            `${position.y}px`;
    });
}


// ======================================================
// PHYSICAL POSITION
// ======================================================

function getPhysicalPosition(planet) {

    return {

        x:
            Math.cos(planet.angle) *
            planet.distanceFromSun,

        y:
            Math.sin(planet.angle) *
            planet.distanceFromSun
    };
}


// ======================================================
// DISTANCE CALCULATION
// ======================================================

function calculateDistance(planetA, planetB) {

    const a =
        getPhysicalPosition(planetA);

    const b =
        getPhysicalPosition(planetB);

    const dx = b.x - a.x;
    const dy = b.y - a.y;

    return Math.sqrt(
        dx * dx +
        dy * dy
    );
}


// ======================================================
// TRAVEL TIME
// ======================================================

function calculateTravelTime(distanceMillionKm) {

    // Simplified simulated spacecraft speed
    const spacecraftSpeed = 50000;

    const distanceKm =
        distanceMillionKm * 1000000;

    const hours =
        distanceKm / spacecraftSpeed;

    return Math.round(
        hours / 24
    );
}


// ======================================================
// CREATE CURVED PATH
// ======================================================

function createControlPoint(start, end) {

    const middleX =
        (start.x + end.x) / 2;

    const middleY =
        (start.y + end.y) / 2;


    const dx =
        end.x - start.x;

    const dy =
        end.y - start.y;


    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (distance === 0) {

        return {
            x: middleX,
            y: middleY
        };
    }


    const perpendicularX =
        -dy / distance;

    const perpendicularY =
        dx / distance;


    const curveAmount =
        Math.min(
            110,
            Math.max(
                35,
                distance * 0.18
            )
        );


    return {

        x:
            middleX +
            perpendicularX *
            curveAmount,

        y:
            middleY +
            perpendicularY *
            curveAmount
    };
}


// ======================================================
// BEZIER POINT
// ======================================================

function getBezierPoint(
    start,
    control,
    end,
    progress
) {

    const inverse =
        1 - progress;


    return {

        x:
            inverse * inverse * start.x +
            2 * inverse * progress * control.x +
            progress * progress * end.x,

        y:
            inverse * inverse * start.y +
            2 * inverse * progress * control.y +
            progress * progress * end.y
    };
}


// ======================================================
// DRAW ROUTE
// ======================================================

function drawRoute(start, control, end) {

    const width =
        solarSystem.clientWidth;

    const height =
        solarSystem.clientHeight;


    missionPath.setAttribute(
        "viewBox",
        `0 0 ${width} ${height}`
    );


    routeLine.setAttribute(
        "d",
        `M ${start.x} ${start.y}
         Q ${control.x} ${control.y}
         ${end.x} ${end.y}`
    );


    routeLine.style.opacity =
        "1";
}


// ======================================================
// SPEED CONTROL
// ======================================================

speedSlider.addEventListener(
    "input",
    () => {

        simulationSpeed =
            Number(speedSlider.value);

        speedValue.textContent =
            `${simulationSpeed}x`;
    }
);


// ======================================================
// DESTINATION CHANGE
// ======================================================

destinationSelect.addEventListener(
    "change",
    () => {

        if (missionRunning) {
            return;
        }


        const destination =
            planets[
                destinationSelect.value
            ];


        destinationData.textContent =
            destination.name;


        distanceData.textContent =
            "—";


        travelData.textContent =
            "—";


        positionData.textContent =
            "Ready";


        missionStatus.textContent =
            "Awaiting Launch";


        missionProgress.style.width =
            "0%";


        progressText.textContent =
            "Destination updated. Ready for mission.";


        rocket.style.display =
            "none";


        routeLine.style.opacity =
            "0";
    }
);


// ======================================================
// LAUNCH MISSION
// ======================================================

launchButton.addEventListener(
    "click",
    () => {

        if (missionRunning) {
            return;
        }


        activeDestinationKey =
            destinationSelect.value;


        const earth =
            planets.earth;


        const destination =
            planets[
                activeDestinationKey
            ];


        // ==================================================
        // LOCK CURRENT POSITIONS
        // ==================================================

        const earthPosition =
            getPlanetPosition(
                earth
            );


        const destinationPosition =
            getPlanetPosition(
                destination
            );


        const start = {

            x: earthPosition.x,
            y: earthPosition.y
        };


        const end = {

            x: destinationPosition.x,
            y: destinationPosition.y
        };


        const control =
            createControlPoint(
                start,
                end
            );


        // ==================================================
        // CALCULATE MISSION DATA
        // ==================================================

        const distance =
            calculateDistance(
                earth,
                destination
            );


        const travelDays =
            calculateTravelTime(
                distance
            );


        // ==================================================
        // START MISSION
        // ==================================================

        missionRunning = true;


        destinationSelect.disabled =
            true;


        launchButton.disabled =
            true;


        // ==================================================
        // FLIGHT DATA
        // ==================================================

        destinationData.textContent =
            destination.name;


        distanceData.textContent =
            `${distance.toFixed(1)} million km`;


        travelData.textContent =
            `${travelDays} days`;


        positionData.textContent =
            "Trajectory locked";


        missionStatus.textContent =
            "Mission In Progress";


        missionProgress.style.width =
            "0%";


        progressText.textContent =
            `Launching Earth → ${destination.name}`;


        launchButton.textContent =
            "Mission Active";


        // ==================================================
        // DRAW FIXED ROUTE
        // ==================================================

        drawRoute(
            start,
            control,
            end
        );


        // ==================================================
        // PLACE ROCKET EXACTLY ON EARTH
        // ==================================================

        rocket.style.display =
            "block";


        rocket.style.left =
            `${start.x}px`;


        rocket.style.top =
            `${start.y}px`;


        // ==================================================
        // ROCKET ANIMATION
        // ==================================================

        const missionStartTime =
            performance.now();


        const missionDuration =
            6000;


        function animateRocket(time) {


            const elapsed =
                time -
                missionStartTime;


            let progress =
                elapsed /
                missionDuration;


            if (progress > 1) {

                progress = 1;
            }


            // Smooth acceleration/deceleration

            const smoothProgress =
                progress *
                progress *
                (3 - 2 * progress);


            // ==================================================
            // POSITION ON CURVE
            // ==================================================

            const position =
                getBezierPoint(
                    start,
                    control,
                    end,
                    smoothProgress
                );


            rocket.style.left =
                `${position.x}px`;


            rocket.style.top =
                `${position.y}px`;


            // ==================================================
            // ROCKET DIRECTION
            // ==================================================

            const nextProgress =
                Math.min(
                    smoothProgress + 0.008,
                    1
                );


            const nextPosition =
                getBezierPoint(
                    start,
                    control,
                    end,
                    nextProgress
                );


            const angle =
                Math.atan2(
                    nextPosition.y -
                    position.y,

                    nextPosition.x -
                    position.x
                ) *
                180 /
                Math.PI;


            rocket.style.transform =
                `translate(-50%, -50%)
                 rotate(${angle + 45}deg)`;


            // ==================================================
            // PROGRESS
            // ==================================================

            const percentage =
                Math.round(
                    progress * 100
                );


            missionProgress.style.width =
                `${percentage}%`;


            progressText.textContent =
                `${percentage}% complete • Earth → ${destination.name}`;


            // ==================================================
            // CONTINUE
            // ==================================================

            if (progress < 1) {

                requestAnimationFrame(
                    animateRocket
                );

            } else {

                finishMission(
                    destination,
                    end
                );
            }
        }


        requestAnimationFrame(
            animateRocket
        );
    }
);


// ======================================================
// FINISH MISSION
// ======================================================

function finishMission(
    destination,
    destinationPosition
) {


    // Exact destination position

    rocket.style.left =
        `${destinationPosition.x}px`;


    rocket.style.top =
        `${destinationPosition.y}px`;


    missionProgress.style.width =
        "100%";


    missionStatus.textContent =
        "Destination Reached";


    positionData.textContent =
        `${destination.name} reached`;


    progressText.textContent =
        `Mission successfully completed: Earth → ${destination.name}.`;


    launchButton.textContent =
        "Mission Complete";


    // Keep result visible for 2 seconds

    setTimeout(
        () => {


            rocket.style.display =
                "none";


            routeLine.style.opacity =
                "0";


            missionRunning =
                false;


            activeDestinationKey =
                null;


            destinationSelect.disabled =
                false;


            launchButton.disabled =
                false;


            launchButton.innerHTML =
                `Launch Mission <span>↗</span>`;


            positionData.textContent =
                "Ready";


            progressText.textContent =
                "Mission complete. Select another destination.";

        },
        2000
    );
}


// ======================================================
// MAIN PLANET ANIMATION
// ======================================================

function animatePlanets() {


    Object.entries(planets).forEach(
        ([key, planet]) => {


            /*
             * DURING A MISSION:
             *
             * Earth pauses.
             * Selected destination pauses.
             * ALL OTHER PLANETS continue moving.
             */


            const shouldPause =
                missionRunning &&
                (
                    key === "earth" ||
                    key === activeDestinationKey
                );


            if (!shouldPause) {

                planet.angle +=
                    planet.speed *
                    simulationSpeed;
            }
        }
    );


    updatePlanetPositions();


    requestAnimationFrame(
        animatePlanets
    );
}


// ======================================================
// RESIZE
// ======================================================

window.addEventListener(
    "resize",
    () => {

        updateOrbitSizes();

        updatePlanetPositions();
    }
);


// ======================================================
// INITIAL SETUP
// ======================================================

destinationData.textContent =
    planets[
        destinationSelect.value
    ].name;


positionData.textContent =
    "Ready";


updatePlanetPositions();


// ======================================================
// START SOLAR SYSTEM
// ======================================================

requestAnimationFrame(
    animatePlanets
);