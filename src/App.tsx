import { Dispatch, FC, ReactNode, createContext, useContext, useEffect, useState } from "react";

import "./App.scss";
import { WhitUrl } from "./whit-url";

const GlobalContext = createContext<GlobalType | null>(null);

interface GlobalType {
    mouseX: number;
    setMouseX: Dispatch<React.SetStateAction<number>>;
    mouseY: number;
    setMouseY: Dispatch<React.SetStateAction<number>>;
    firstClick: boolean;
    setFirstClick: Dispatch<React.SetStateAction<boolean>>;
}

const useGlobalContext = () => {
    const context = useContext(GlobalContext);

    if (!context) {
        throw new Error("you need to wrap with Global Provider");
    }

    return context;
};

const GlobalProvider = ({ children }: { children: ReactNode }) => {
    const [firstClick, setFirstClick] = useState(true);
    const [mouseX, setMouseX] = useState(0);
    const [mouseY, setMouseY] = useState(0);

    return (
        <GlobalContext.Provider value={{ firstClick, setFirstClick, mouseX, setMouseX, mouseY, setMouseY }}>
            {children}
        </GlobalContext.Provider>
    );
};

const MIN_DISTANCE = Math.sqrt(2) * 96;

interface Coord {
    x: number;
    y: number;
}

const getAngle = (first: Coord, second: Coord) => {
    return Math.atan2(second.y - first.y, second.x - first.x);
};

const getDistance = (first: Coord, second: Coord) => {
    return Math.sqrt((second.x - first.x) ** 2 + (second.y - first.y) ** 2);
};

const wrapX = (x: number) => {
    if (x < -MIN_DISTANCE / 3) {
        return window.innerWidth - MIN_DISTANCE / 3;
    }

    if (x > window.innerWidth + MIN_DISTANCE / 3) {
        return MIN_DISTANCE / 3;
    }

    return x;
};

const wrapY = (y: number) => {
    if (y < -MIN_DISTANCE / 3) {
        return window.innerHeight - MIN_DISTANCE / 3;
    }

    if (y > window.innerHeight + MIN_DISTANCE / 3) {
        return MIN_DISTANCE / 3;
    }

    return y;
};

const Hammer = () => {
    const [active, setActive] = useState(false);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);

    useEffect(() => {
        const onMousedown = () => {
            setActive(true);
        };
        const onMouseup = () => {
            setActive(false);
        };

        document.addEventListener("mousedown", onMousedown);
        document.addEventListener("mouseup", onMouseup);

        return () => {
            document.removeEventListener("mousedown", onMousedown);
            document.removeEventListener("mouseup", onMouseup);
        };
    }, [setActive]);

    useEffect(() => {
        const onMousemove = (event: MouseEvent) => {
            setX(event.x);
            setY(event.y);
        };

        document.addEventListener("click", onMousemove);
        document.addEventListener("mousemove", onMousemove);

        return () => {
            document.removeEventListener("click", onMousemove);
            document.removeEventListener("mousemove", onMousemove);
        };
    }, [setX, setY]);

    return <img className={active ? "hammer active" : "hammer"} src="hammer.png" style={{ left: `${x}px`, top: `${y}px` }} />;
};

const Cat: FC<Partial<Coord & { alt?: boolean }>> = ({ x: xx, y: yy, alt }) => {
    const [x, setX] = useState(xx ?? window.innerWidth / 2);
    const [y, setY] = useState(yy ?? window.innerHeight / 2);

    const { firstClick, setFirstClick } = useGlobalContext();

    useEffect(() => {
        const onResize = () => {
            setX((prev) => wrapX(prev));
            setY((prev) => wrapY(prev));
        };

        window.addEventListener("orientationchange", onResize);
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("orientationchange", onResize);
            window.removeEventListener("resize", onResize);
        };
    }, [setX, setY]);

    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (firstClick) {
                const catPosition = { x, y };
                const mousePosition = event;

                const distance = getDistance(catPosition, mousePosition);

                if (distance < MIN_DISTANCE / 2) {
                    setFirstClick(false);
                }
            }

            const catPosition = { x, y };
            const mousePosition = event;

            const distance = getDistance(catPosition, mousePosition);

            if (distance > MIN_DISTANCE) {
                return;
            }

            const angle = getAngle(mousePosition, catPosition);

            const _x = wrapX(event.x + Math.cos(angle) * MIN_DISTANCE);
            const _y = wrapY(event.y + Math.sin(angle) * MIN_DISTANCE);

            setX(_x);
            setY(_y);
        };

        const onMousemove = (event: MouseEvent) => {
            if (firstClick) {
                return;
            }

            onClick(event);
        };

        document.addEventListener("mousemove", onMousemove);
        document.addEventListener("click", onClick);

        return () => {
            document.removeEventListener("mousemove", onMousemove);
            document.removeEventListener("click", onClick);
        };
    }, [x, setX, y, setY, firstClick, setFirstClick]);

    return <img className="cat" src={alt ? "cat-1.gif" : "cat-2.gif"} style={{ left: `${x}px`, top: `${y}px` }} />;
};

const Cats = () => {
    const [cats, setCats] = useState<(Coord & { alt: boolean })[]>([]);

    useEffect(() => {
        const onClick = () => {
            setCats((prev) => [
                ...prev,
                ...Array.from({ length: 10 }).map(() => ({
                    alt: Math.random() < 1 / 9 / 2,
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                })),
            ]);
        };

        document.addEventListener("click", onClick);

        return () => {
            document.removeEventListener("click", onClick);
        };
    }, []);

    return (
        <>
            {cats.map(({ x, y, alt }, i) => (
                <Cat key={i} x={x} y={y} alt={alt} />
            ))}
        </>
    );
};

// disco font
// https://codepen.io/tjoen/pen/ByZrdZ

// disco ball
// https://codepen.io/msaetre/pen/eYwqrb

// spotlight
// https://dev.to/finiam/spotlight-effect-with-js-and-css-an6

const Light: FC<{ className: string }> = ({ className }) => {
    return (
        <div className={`light ${className}`}>
            <div className="inner" />
        </div>
    );
};

const Main = () => {
    const { firstClick } = useGlobalContext();

    return (
        <>
            {firstClick && <span>Oh No A Twerking Cat! Quick remove it!</span>}
            {!firstClick && (
                <span className="disco-font">
                    TOO<br></br>BAD
                </span>
            )}
            <Cat />
            <Cats />
            <Hammer />
            {!firstClick && (
                <>
                    <Light className="light-2" />
                    <Light className="light-1" />
                </>
            )}
        </>
    );
};

const App = () => {
    return (
        <GlobalProvider>
            <Main />
            <WhitUrl />
        </GlobalProvider>
    );
};

export default App;
