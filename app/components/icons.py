# app/icons/bb_icon.py
import reflex as rx


def bb_icon(**props) -> rx.Component:
    """Bottom-bracket icon driven by currentColor."""
    return rx.box(
        rx.html(
            """
            <svg width="100%" height="50%" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <mask id="bb-mask">
            <!--Everything starts visible-->
                <rect x="0" y="0" width="100" height="50" fill="white"/>
            <!--Black = cut-out areas (slots)-->
            <!--Vertically centered slots-->
                <rect x="3" y="12" width="12" height="2" rx="1" fill="black"/>
                <rect x="3" y="18" width="12" height="2" rx="1" fill="black"/>
                <rect x="3" y="24" width="12" height="2" rx="1" fill="black"/>
                <rect x="3" y="30" width="12" height="2" rx="1" fill="black"/>
                <rect x="3" y="36" width="12" height="2" rx="1" fill="black"/>
                <rect x="85" y="12" width="12" height="2" rx="1" fill="black"/>
                <rect x="85" y="18" width="12" height="2" rx="1" fill="black"/>
                <rect x="85" y="24" width="12" height="2" rx="1" fill="black"/>
                <rect x="85" y="30" width="12" height="2" rx="1" fill="black"/>
                <rect x="85" y="36" width="12" height="2" rx="1" fill="black"/>
                </mask>
            </defs>
            <!--ALL COLOR comes from currentColor-->
            <g fill="currentColor" mask="url(#bb-mask)">
            <!--Left cup-->
                <rect x="0" y="5" width="18" height="40" rx="3"/>
            <!--Left chamfer-->
                <path d="M20 10 L28 10 L32 14 L32 36 L28 40 L20 40 Z"/>
            <!--Middle block-->
                <rect x="34" y="14" width="32" height="22" rx="2"/>
            <!--Right chamfer-->
                <path d="M80 10 L72 10 L68 14 L68 36 L72 40 L80 40 Z"/>
            <!--Right cup-->
                <rect x="82" y="5" width="18" height="40" rx="3"/>
            </g>
            </svg>
            """
        ),
        width="30px",
        height="30px",
        display="inline-flex",
        align_items="center",
        justify_content="center",
        color="var(--text)",          # drives currentColor
        # flex_shrink="0",
        class_name="point-type-icon",   # so your JS can find it
        **props,
    )

def wheel_icon(**props) -> rx.Component:
    """Bottom-bracket icon driven by currentColor."""
    return rx.box(
        rx.html(
            """
            <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            
            <g stroke="black" stroke-width="2" fill="none">
                <circle cx="50" cy="50" r="40" /> <g fill="black" transform="translate(50, 50)">
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(0)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(10)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(20)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(30)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(40)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(50)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(60)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(70)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(80)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(90)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(100)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(110)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(120)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(130)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(140)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(150)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(160)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(170)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(180)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(190)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(200)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(210)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(220)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(230)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(240)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(250)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(260)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(270)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(280)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(290)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(300)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(310)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(320)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(330)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(340)"/>
                <path d="M 43 -5 L 47 -5 L 47 -2 L 43 -2 Z" transform="rotate(350)"/>
                </g>
            </g>

            <g stroke="black" stroke-width="2">
                <line x1="50" y1="40" x2="50" y2="25" />
                <line x1="50" y1="60" x2="50" y2="75" />
                <line x1="40" y1="50" x2="25" y2="50" />
                <line x1="60" y1="50" x2="75" y2="50" />
                
                <line x1="42.9" y1="42.9" x2="32" y2="32" /> <line x1="57.1" y1="57.1" x2="68" y2="68" /> <line x1="42.9" y1="57.1" x2="32" y2="68" /> <line x1="57.1" y1="42.9" x2="68" y2="32" /> </g>

            <g stroke="black" stroke-width="2">
                <circle cx="50" cy="50" r="15" fill="none" /> <circle cx="50" cy="50" r="10" fill="#FF0000" /> <circle cx="50" cy="50" r="4" fill="white" stroke="black" stroke-width="1" /> </g>

            </svg>
            """
        ),
        width="30px",
        height="30px",
        display="inline-flex",
        align_items="center",
        justify_content="center",
        color="var(--accent)",          # drives currentColor
        # flex_shrink="0",
        class_name="point-type-icon",   # so your JS can find it
        **props,
    )
