import { useState } from "react";

import "./WhitUrl.scss";

export const WhitUrl = () => {
    const [active, setActive] = useState(false);

    const onMouseOver = () => {
        setActive(true);
    };

    const onMouseLeave = () => {
        setActive(false);
    };

    return (
        <>
            <a
                className="whit-url-anchor"
                href="https://www.twitch.tv/whiticious"
                target="_blank"
                onFocus={onMouseOver}
                onMouseOver={onMouseOver}
                onBlur={onMouseLeave}
                onMouseLeave={onMouseLeave}
            >
                Whiticious
            </a>
            <img className={active ? "whit-url-image active" : "whit-url-image"} src="/whit.png"></img>
        </>
    );
};
