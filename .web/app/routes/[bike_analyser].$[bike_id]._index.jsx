import {Fragment,useCallback,useContext,useEffect,useRef} from "react"
import {Box as RadixThemesBox,Button as RadixThemesButton,Card as RadixThemesCard,DropdownMenu as RadixThemesDropdownMenu,Flex as RadixThemesFlex,Heading as RadixThemesHeading,IconButton as RadixThemesIconButton,Link as RadixThemesLink,Text as RadixThemesText} from "@radix-ui/themes"
import {Link as ReactRouterLink} from "react-router"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,isNotNullOrUndefined,isTrue,refs} from "$/utils/state"
import {Activity as LucideActivity,Anchor as LucideAnchor,ChevronDown as LucideChevronDown,CircleDot as LucideCircleDot,Link as LucideLink,User as LucideUser} from "lucide-react"
import {Helmet} from "react-helmet"
import {jsx} from "@emotion/react"




function Link_7791ce1263bb1fc828d028f3bd7798d7 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_8cba84e1b6dd8ea1633c1e12cab646fc = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___page_state____page_state.goto", ({ ["path"] : "/news", ["message"] : "Loading news..." }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) }),onClick:on_click_8cba84e1b6dd8ea1633c1e12cab646fc},jsx(ReactRouterLink,{to:"/news"},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--text)" }),size:"5"},"News")))
  )
}


function Link_7e2142eaacfc4e664d63fc92b0517ac8 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_db0361ccc2a273952b2a39e53ea406db = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.goto_bikes", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesLink,{css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) }),href:"#",onClick:on_click_db0361ccc2a273952b2a39e53ea406db},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--text)" }),size:"5"},"Bikes"))
  )
}


function Link_bb99783a5bec6e6089350098953110d9 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_b225be8973122fade5e09b6f66c0cd5c = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___page_state____page_state.goto", ({ ["path"] : "/sheds", ["message"] : "Loading sheds..." }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) }),onClick:on_click_b225be8973122fade5e09b6f66c0cd5c},jsx(ReactRouterLink,{to:"/sheds"},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--text)" }),size:"5"},"Sheds")))
  )
}


function Dropdownmenu__item_2eb1bc7cebe117a4cfccf6cd9dd34d7d () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_7351b922d66a74eeb47582e698cc8e54 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___auth_state____auth_state.logout", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesDropdownMenu.Item,{onClick:on_click_7351b922d66a74eeb47582e698cc8e54},"Log out")
  )
}


function Text_9d3a7751e97881a128bab8621a2a3c6a () {
  const reflex___state____state__app___state___page_state____page_state = useContext(StateContexts.reflex___state____state__app___state___page_state____page_state)



  return (
    jsx(RadixThemesText,{as:"p",size:"4",weight:"medium"},reflex___state____state__app___state___page_state____page_state.loading_message_rx_state_)
  )
}


function Img_cac7064b7f5550138d6f1226af7cfb35 () {
  const ref_bike_image = useRef(null); refs["ref_bike_image"] = ref_bike_image;
const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx("img",{css:({ ["width"] : "100%", ["height"] : "100%", ["objectFit"] : "contain" }),id:"bike-image",ref:ref_bike_image,src:(isTrue(reflex___state____state__app___state___bike_state____bike_state.current_bike_rx_state_?.["hero_url"]) ? reflex___state____state__app___state___bike_state____bike_state.current_bike_rx_state_?.["hero_url"] : "")},)
  )
}


function Fragment_c73d67842ea9b7a66a3601a5e657a099 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___bike_state____bike_state.current_bike_rx_state_?.valueOf?.() === ({  })?.valueOf?.()))?(jsx(Fragment,{},jsx(Img_cac7064b7f5550138d6f1226af7cfb35,{},))):(jsx(Fragment,{},jsx(RadixThemesText,{as:"p",size:"4"},"Bike not found")))))
  )
}


function Box_c88ec3bd2cda5556c33f09d03f7c6fdc () {
  const ref_bike_viewer_container = useRef(null); refs["ref_bike_viewer_container"] = ref_bike_viewer_container;
const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)
const ref_bike_viewer_inner = useRef(null); refs["ref_bike_viewer_inner"] = ref_bike_viewer_inner;



  return (
    jsx(RadixThemesBox,{css:({ ["background"] : "var(--bg)", ["width"] : "100%", ["height"] : "500px", ["position"] : "relative", ["overflow"] : "hidden" }),"data-access-token":reflex___state____state__app___state___auth_state____auth_state.access_token_rx_state_,"data-backend-origin":"https://trigpoint-backend-724448413572.europe-west2.run.app","data-bike-id":(isTrue(reflex___state____state__app___state___bike_state____bike_state.current_bike_rx_state_?.["id"]) ? reflex___state____state__app___state___bike_state____bike_state.current_bike_rx_state_?.["id"] : null),id:"bike-viewer-container",ref:ref_bike_viewer_container},jsx(RadixThemesBox,{css:({ ["position"] : "relative", ["width"] : "100%", ["height"] : "100%" }),id:"bike-viewer-inner",ref:ref_bike_viewer_inner},jsx(Fragment_c73d67842ea9b7a66a3601a5e657a099,{},)))
  )
}


function Button_54d1c8961831d80e10063c6b1488cc3d () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_cb0cc9be94b71bed21d2724d22d9f226 = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "\n                    (() => {\n                        const c = document.getElementById('bike-viewer-container');\n                        const bv = c?.bikeViewer;\n                        if (!bv) return;\n                        // mark this as a UI-origin click so JS can suppress the next canvas pointerdown\n                        bv.setType('bb', { fromUI: true });\n                    })();\n                    ", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"point-type-btn",css:({ ["background"] : "var(--bg)", ["width"] : "40px", ["height"] : "40px", ["padding"] : "0", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "width 0.18s ease, background 0.15s ease, box-shadow 0.15s ease", ["pointerEvents"] : "auto", ["&:hover"] : ({ ["boxShadow"] : "0 0 4px var(--text-dark)" }), ["&:active"] : ({ ["transform"] : "scale(0.97)" }) }),"data-point-type":"bb",onClick:on_click_cb0cc9be94b71bed21d2724d22d9f226,variant:"solid"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"0"},jsx(RadixThemesBox,{className:"point-type-icon",css:({ ["width"] : "30px", ["height"] : "30px", ["display"] : "inline-flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["color"] : "var(--text)" })},jsx("div",{className:"rx-Html",dangerouslySetInnerHTML:({ ["__html"] : "\n            <svg width=\"100%\" height=\"50%\" viewBox=\"0 0 100 50\" xmlns=\"http://www.w3.org/2000/svg\">\n            <defs>\n                <mask id=\"bb-mask\">\n            <!--Everything starts visible-->\n                <rect x=\"0\" y=\"0\" width=\"100\" height=\"50\" fill=\"white\"/>\n            <!--Black = cut-out areas (slots)-->\n            <!--Vertically centered slots-->\n                <rect x=\"3\" y=\"12\" width=\"12\" height=\"2\" rx=\"1\" fill=\"black\"/>\n                <rect x=\"3\" y=\"18\" width=\"12\" height=\"2\" rx=\"1\" fill=\"black\"/>\n                <rect x=\"3\" y=\"24\" width=\"12\" height=\"2\" rx=\"1\" fill=\"black\"/>\n                <rect x=\"3\" y=\"30\" width=\"12\" height=\"2\" rx=\"1\" fill=\"black\"/>\n                <rect x=\"3\" y=\"36\" width=\"12\" height=\"2\" rx=\"1\" fill=\"black\"/>\n                <rect x=\"85\" y=\"12\" width=\"12\" height=\"2\" rx=\"1\" fill=\"black\"/>\n                <rect x=\"85\" y=\"18\" width=\"12\" height=\"2\" rx=\"1\" fill=\"black\"/>\n                <rect x=\"85\" y=\"24\" width=\"12\" height=\"2\" rx=\"1\" fill=\"black\"/>\n                <rect x=\"85\" y=\"30\" width=\"12\" height=\"2\" rx=\"1\" fill=\"black\"/>\n                <rect x=\"85\" y=\"36\" width=\"12\" height=\"2\" rx=\"1\" fill=\"black\"/>\n                </mask>\n            </defs>\n            <!--ALL COLOR comes from currentColor-->\n            <g fill=\"currentColor\" mask=\"url(#bb-mask)\">\n            <!--Left cup-->\n                <rect x=\"0\" y=\"5\" width=\"18\" height=\"40\" rx=\"3\"/>\n            <!--Left chamfer-->\n                <path d=\"M20 10 L28 10 L32 14 L32 36 L28 40 L20 40 Z\"/>\n            <!--Middle block-->\n                <rect x=\"34\" y=\"14\" width=\"32\" height=\"22\" rx=\"2\"/>\n            <!--Right chamfer-->\n                <path d=\"M80 10 L72 10 L68 14 L68 36 L72 40 L80 40 Z\"/>\n            <!--Right cup-->\n                <rect x=\"82\" y=\"5\" width=\"18\" height=\"40\" rx=\"3\"/>\n            </g>\n            </svg>\n            " })},)),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesText,{as:"p",className:"point-type-label",css:({ ["color"] : "var(--text-light)", ["whiteSpace"] : "nowrap", ["overflow"] : "hidden", ["maxWidth"] : "0px" })},"Bottom Bracket")))
  )
}


function Button_81d2d34d73568c236ea8de88e6202240 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_d708baf8f28996801a92de162dad88be = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "\n                    (() => {\n                        const c = document.getElementById('bike-viewer-container');\n                        const bv = c?.bikeViewer;\n                        if (!bv) return;\n                        // mark this as a UI-origin click so JS can suppress the next canvas pointerdown\n                        bv.setType('rear_axle', { fromUI: true });\n                    })();\n                    ", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"point-type-btn",css:({ ["background"] : "var(--bg)", ["width"] : "40px", ["height"] : "40px", ["padding"] : "0", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "width 0.18s ease, background 0.15s ease, box-shadow 0.15s ease", ["pointerEvents"] : "auto", ["&:hover"] : ({ ["boxShadow"] : "0 0 4px var(--text-dark)" }), ["&:active"] : ({ ["transform"] : "scale(0.97)" }) }),"data-point-type":"rear_axle",onClick:on_click_d708baf8f28996801a92de162dad88be,variant:"solid"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"0"},jsx("img",{css:({ ["pointerEvents"] : "auto", ["width"] : "35px", ["height"] : "35px", ["objectFit"] : "contain" }),src:"/icons/rwheel.png"},),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesText,{as:"p",className:"point-type-label",css:({ ["color"] : "var(--text-light)", ["whiteSpace"] : "nowrap", ["overflow"] : "hidden", ["maxWidth"] : "0px" })}," Rear Axle")))
  )
}


function Button_714178e48f41a817873ce3ec30b17430 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_335783fc955863c82856c95e22e3256e = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "\n                    (() => {\n                        const c = document.getElementById('bike-viewer-container');\n                        const bv = c?.bikeViewer;\n                        if (!bv) return;\n                        // mark this as a UI-origin click so JS can suppress the next canvas pointerdown\n                        bv.setType('front_axle', { fromUI: true });\n                    })();\n                    ", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"point-type-btn",css:({ ["background"] : "var(--bg)", ["width"] : "40px", ["height"] : "40px", ["padding"] : "0", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "width 0.18s ease, background 0.15s ease, box-shadow 0.15s ease", ["pointerEvents"] : "auto", ["&:hover"] : ({ ["boxShadow"] : "0 0 4px var(--text-dark)" }), ["&:active"] : ({ ["transform"] : "scale(0.97)" }) }),"data-point-type":"front_axle",onClick:on_click_335783fc955863c82856c95e22e3256e,variant:"solid"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"0"},jsx("img",{css:({ ["pointerEvents"] : "auto", ["width"] : "35px", ["height"] : "35px", ["objectFit"] : "contain" }),src:"/icons/fwheel.png"},),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesText,{as:"p",className:"point-type-label",css:({ ["color"] : "var(--text-light)", ["whiteSpace"] : "nowrap", ["overflow"] : "hidden", ["maxWidth"] : "0px" })}," Front Axle")))
  )
}


function Button_3ea1c73fc6df5398f742ad2654c6018f () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_db687495d7277cb95ac97bb10527f542 = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "\n                    (() => {\n                        const c = document.getElementById('bike-viewer-container');\n                        const bv = c?.bikeViewer;\n                        if (!bv) return;\n                        // mark this as a UI-origin click so JS can suppress the next canvas pointerdown\n                        bv.setType('free', { fromUI: true });\n                    })();\n                    ", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"point-type-btn",css:({ ["background"] : "var(--bg)", ["width"] : "40px", ["height"] : "40px", ["padding"] : "0", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "width 0.18s ease, background 0.15s ease, box-shadow 0.15s ease", ["pointerEvents"] : "auto", ["&:hover"] : ({ ["boxShadow"] : "0 0 4px var(--text-dark)" }), ["&:active"] : ({ ["transform"] : "scale(0.97)" }) }),"data-point-type":"free",onClick:on_click_db687495d7277cb95ac97bb10527f542,variant:"solid"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"0"},jsx(LucideCircleDot,{className:"point-type-icon",css:({ ["color"] : "var(--text)" }),size:30},),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesText,{as:"p",className:"point-type-label",css:({ ["color"] : "var(--text-light)", ["whiteSpace"] : "nowrap", ["overflow"] : "hidden", ["maxWidth"] : "0px" })},"Free pivot")))
  )
}


function Button_a87b7f56c2e9837e37e0c562b47f2307 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_2a8927393584020a93337085f11943f1 = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "\n                    (() => {\n                        const c = document.getElementById('bike-viewer-container');\n                        const bv = c?.bikeViewer;\n                        if (!bv) return;\n                        // mark this as a UI-origin click so JS can suppress the next canvas pointerdown\n                        bv.setType('fixed', { fromUI: true });\n                    })();\n                    ", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"point-type-btn",css:({ ["background"] : "var(--bg)", ["width"] : "40px", ["height"] : "40px", ["padding"] : "0", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "width 0.18s ease, background 0.15s ease, box-shadow 0.15s ease", ["pointerEvents"] : "auto", ["&:hover"] : ({ ["boxShadow"] : "0 0 4px var(--text-dark)" }), ["&:active"] : ({ ["transform"] : "scale(0.97)" }) }),"data-point-type":"fixed",onClick:on_click_2a8927393584020a93337085f11943f1,variant:"solid"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"0"},jsx(LucideAnchor,{className:"point-type-icon",css:({ ["color"] : "var(--text)" }),size:30},),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesText,{as:"p",className:"point-type-label",css:({ ["color"] : "var(--text-light)", ["whiteSpace"] : "nowrap", ["overflow"] : "hidden", ["maxWidth"] : "0px" })},"Fixed pivot")))
  )
}


function Button_01e16a2f825fbea7f0857be8c3b90020 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_7d61c53971c6c4df80777a4c06dc5780 = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "\n                    (() => {\n                        const c = document.getElementById('bike-viewer-container');\n                        const bv = c?.bikeViewer;\n                        if (!bv) return;\n                        // behaves like point setType, with fromUI flag\n                        bv.setLinkType('bar', { fromUI: true });\n                    })();\n                    ", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"link-type-btn",css:({ ["background"] : "var(--bg)", ["width"] : "40px", ["height"] : "40px", ["padding"] : "0", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "width 0.18s ease, background 0.15s ease, box-shadow 0.15s ease", ["pointerEvents"] : "auto", ["&:hover"] : ({ ["boxShadow"] : "0 0 4px var(--text-dark)" }), ["&:active"] : ({ ["transform"] : "scale(0.97)" }) }),"data-link-type":"bar",onClick:on_click_7d61c53971c6c4df80777a4c06dc5780,variant:"solid"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"0"},jsx(LucideLink,{className:"link-type-icon",css:({ ["color"] : "var(--text-dark)" }),size:30},),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesText,{as:"p",className:"link-type-label",css:({ ["color"] : "var(--text-light)", ["whiteSpace"] : "nowrap", ["overflow"] : "hidden", ["maxWidth"] : "0px" })},"Rigid Link")))
  )
}


function Button_3cef9e181c71fca6eb33ea31c4971c7f () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_d665cbac9f32ca82176ddea511308a3d = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "\n                    (() => {\n                        const c = document.getElementById('bike-viewer-container');\n                        const bv = c?.bikeViewer;\n                        if (!bv) return;\n                        // behaves like point setType, with fromUI flag\n                        bv.setLinkType('shock', { fromUI: true });\n                    })();\n                    ", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"link-type-btn",css:({ ["background"] : "var(--bg)", ["width"] : "40px", ["height"] : "40px", ["padding"] : "0", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "width 0.18s ease, background 0.15s ease, box-shadow 0.15s ease", ["pointerEvents"] : "auto", ["&:hover"] : ({ ["boxShadow"] : "0 0 4px var(--text-dark)" }), ["&:active"] : ({ ["transform"] : "scale(0.97)" }) }),"data-link-type":"shock",onClick:on_click_d665cbac9f32ca82176ddea511308a3d,variant:"solid"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"0"},jsx(LucideActivity,{className:"link-type-icon",css:({ ["color"] : "var(--text-dark)" }),size:30},),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesText,{as:"p",className:"link-type-label",css:({ ["color"] : "var(--text-light)", ["whiteSpace"] : "nowrap", ["overflow"] : "hidden", ["maxWidth"] : "0px" })},"Shock Link")))
  )
}


function Button_000208db18b9cbe52a3e73c36075c19c () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)
const reflex___state____state__app___state___kinematics_state____kinematics_state = useContext(StateContexts.reflex___state____state__app___state___kinematics_state____kinematics_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_c2e7bddcf54161e4b3fdc6b668258ef9 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___kinematics_state____kinematics_state.load_kinematics", ({ ["bike_id"] : (isTrue(reflex___state____state__app___state___bike_state____bike_state.current_bike_rx_state_?.["id"]) ? reflex___state____state__app___state___bike_state____bike_state.current_bike_rx_state_?.["id"] : null), ["access_token"] : reflex___state____state__app___state___auth_state____auth_state.access_token_rx_state_ }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent, reflex___state____state__app___state___bike_state____bike_state, reflex___state____state__app___state___auth_state____auth_state])

  return (
    jsx(RadixThemesButton,{disabled:reflex___state____state__app___state___kinematics_state____kinematics_state.is_loading_rx_state_,onClick:on_click_c2e7bddcf54161e4b3fdc6b668258ef9},(reflex___state____state__app___state___kinematics_state____kinematics_state.is_loading_rx_state_ ? "Running\u2026" : "Run solver"))
  )
}


function Text_54b12870d9937576313de642c5bfc9b2 () {
  const reflex___state____state__app___state___kinematics_state____kinematics_state = useContext(StateContexts.reflex___state____state__app___state___kinematics_state____kinematics_state)



  return (
    jsx(RadixThemesText,{as:"p",css:({ ["color"] : "red" })},reflex___state____state__app___state___kinematics_state____kinematics_state.error_rx_state_)
  )
}


function Fragment_1a9a1efc35612638c4c26ee1553f8530 () {
  const reflex___state____state__app___state___kinematics_state____kinematics_state = useContext(StateContexts.reflex___state____state__app___state___kinematics_state____kinematics_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___kinematics_state____kinematics_state.has_result_rx_state_?(jsx(Fragment,{},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "green" })},"Solver ran successfully."))):(jsx(Fragment,{},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "gray" })},"No kinematics yet. Run solver.")))))
  )
}


function Fragment_c56480710dc84bd6e19f1db97d11d4cd () {
  const reflex___state____state__app___state___kinematics_state____kinematics_state = useContext(StateContexts.reflex___state____state__app___state___kinematics_state____kinematics_state)



  return (
    jsx(Fragment,{},(isNotNullOrUndefined(reflex___state____state__app___state___kinematics_state____kinematics_state.error_rx_state_)?(jsx(Fragment,{},jsx(Text_54b12870d9937576313de642c5bfc9b2,{},))):(jsx(Fragment_1a9a1efc35612638c4c26ee1553f8530,{},))))
  )
}


function Box_7be8694fb06795a448256556334abe74 () {
  const reflex___state____state__app___state___kinematics_state____kinematics_state = useContext(StateContexts.reflex___state____state__app___state___kinematics_state____kinematics_state)



  return (
    jsx(RadixThemesBox,{css:({ ["width"] : "100%" })},Array.prototype.map.call(reflex___state____state__app___state___kinematics_state____kinematics_state.solver_steps_rx_state_ ?? [],((step_rx_state_,index_1d125e7374d4fc005d932966922f1ee5)=>(jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",key:index_1d125e7374d4fc005d932966922f1ee5,gap:"2"},jsx(RadixThemesText,{as:"p",css:({ ["width"] : "12%" })},step_rx_state_?.["step_index"]),jsx(RadixThemesText,{as:"p",css:({ ["width"] : "26%" })},step_rx_state_?.["shock_stroke"]),jsx(RadixThemesText,{as:"p",css:({ ["width"] : "26%" })},step_rx_state_?.["rear_travel"]),jsx(RadixThemesText,{as:"p",css:({ ["width"] : "26%" })},step_rx_state_?.["leverage_ratio"]))))))
  )
}


function Fragment_29b88f934776af0c00f34dc99a7f752f () {
  const reflex___state____state__app___state___kinematics_state____kinematics_state = useContext(StateContexts.reflex___state____state__app___state___kinematics_state____kinematics_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___kinematics_state____kinematics_state.has_result_rx_state_?(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesText,{as:"p",weight:"medium"},"Stroke \u2192 Travel / Leverage"),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",gap:"2"},jsx(RadixThemesText,{as:"p",css:({ ["width"] : "12%" }),weight:"medium"},"Step"),jsx(RadixThemesText,{as:"p",css:({ ["width"] : "26%" }),weight:"medium"},"Stroke"),jsx(RadixThemesText,{as:"p",css:({ ["width"] : "26%" }),weight:"medium"},"Travel"),jsx(RadixThemesText,{as:"p",css:({ ["width"] : "26%" }),weight:"medium"},"Leverage")),jsx(Box_7be8694fb06795a448256556334abe74,{},)))):(jsx(Fragment,{},jsx(RadixThemesBox,{},)))))
  )
}


function Fragment_952a67c8244fb7a872b68d40d93bc108 () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)
const ref_point_tools_panel = useRef(null); refs["ref_point_tools_panel"] = ref_point_tools_panel;
const ref_bike_details_section = useRef(null); refs["ref_bike_details_section"] = ref_bike_details_section;



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___state___auth_state____auth_state.access_token_rx_state_)?(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "stretch", ["width"] : "100%" }),direction:"column",gap:"0"},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["position"] : "relative", ["paddingBottom"] : "2.5rem" })},jsx(Helmet,{},jsx("script",{src:"/js/bike_viewer/index.js",type:"module"},)),jsx(Box_c88ec3bd2cda5556c33f09d03f7c6fdc,{},),jsx(RadixThemesBox,{css:({ ["position"] : "absolute", ["top"] : "16px", ["right"] : "8px", ["display"] : "flex", ["flexDirection"] : "column", ["width"] : "150px", ["zIndex"] : "20", ["pointerEvents"] : "none" }),id:"point-tools-panel",ref:ref_point_tools_panel},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "flex-end" }),direction:"column",gap:"2"},jsx(RadixThemesBox,{css:({ ["width"] : "40px", ["height"] : "2px", ["background"] : "var(--text-dark)", ["marginTop"] : "1px", ["marginBottom"] : "1px", ["opacity"] : "0.5" })},),jsx(Button_54d1c8961831d80e10063c6b1488cc3d,{},),jsx(Button_81d2d34d73568c236ea8de88e6202240,{},),jsx(Button_714178e48f41a817873ce3ec30b17430,{},),jsx(Button_3ea1c73fc6df5398f742ad2654c6018f,{},),jsx(Button_a87b7f56c2e9837e37e0c562b47f2307,{},),jsx(RadixThemesBox,{css:({ ["width"] : "40px", ["height"] : "2.5px", ["background"] : "var(--text-dark)", ["marginTop"] : "6px", ["marginBottom"] : "6px", ["opacity"] : "0.5" })},),jsx(Button_01e16a2f825fbea7f0857be8c3b90020,{},),jsx(Button_3cef9e181c71fca6eb33ea31c4971c7f,{},))),jsx(RadixThemesIconButton,{css:({ ["padding"] : "6px", ["borderRadius"] : "full", ["position"] : "absolute", ["bottom"] : "8px", ["left"] : "50%", ["zIndex"] : "25" }),size:"4",variant:"ghost"},jsx(LucideChevronDown,{size:48},))),jsx(RadixThemesBox,{css:({ ["paddingTop"] : "2.5rem", ["paddingBottom"] : "4rem", ["paddingInlineStart"] : "1rem", ["paddingInlineEnd"] : "1rem", ["width"] : "100%", ["maxWidth"] : "960px", ["marginInlineStart"] : "auto", ["marginInlineEnd"] : "auto" }),id:"bike-details-section",ref:ref_bike_details_section},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "flex-start" }),direction:"column",gap:"4"},jsx(RadixThemesHeading,{size:"5"},"Bike details"),jsx(RadixThemesText,{as:"p",css:({ ["opacity"] : "0.8" }),size:"3"},"Here we\u2019ll show component lists, geometry tables, and linkage charts."),jsx(RadixThemesBox,{css:({ ["paddingTop"] : "0.75rem", ["paddingBottom"] : "0.75rem", ["paddingInlineStart"] : "1rem", ["paddingInlineEnd"] : "1rem", ["borderRadius"] : "0.75rem", ["border"] : "1px solid rgba(255,255,255,0.08)", ["background"] : "rgba(255,255,255,0.02)" })},jsx(RadixThemesText,{as:"p"},"\u2022 Component list / build spec (coming soon)"),jsx(RadixThemesText,{as:"p"},"\u2022 Geometry table (reach, stack, CS length, etc.)"),jsx(RadixThemesText,{as:"p"},"\u2022 Linkage charts (leverage ratio, axle path, anti-squat\u2026)")))),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%", ["border"] : "1px solid #444", ["padding"] : "0.75rem", ["borderRadius"] : "0.5rem" }),direction:"column",gap:"3"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"2"},jsx(RadixThemesText,{as:"p",weight:"medium"},"Kinematics")),jsx(Button_000208db18b9cbe52a3e73c36075c19c,{},),jsx(Fragment_c56480710dc84bd6e19f1db97d11d4cd,{},),jsx(Fragment_29b88f934776af0c00f34dc99a7f752f,{},))))):(jsx(Fragment,{},jsx(RadixThemesBox,{},)))))
  )
}


function Fragment_1d27a9abd7849922af5b9bb345d413bf () {
  const reflex___state____state__app___state___page_state____page_state = useContext(StateContexts.reflex___state____state__app___state___page_state____page_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___page_state____page_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["width"] : "100%", ["height"] : "100%", ["padding"] : "2rem" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"column",gap:"2"},jsx(Text_9d3a7751e97881a128bab8621a2a3c6a,{},),jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--gray-9)" }),size:"2"},"Please wait"))))):(jsx(Fragment_952a67c8244fb7a872b68d40d93bc108,{},))))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack page",css:({ ["height"] : "100vh" }),direction:"row",gap:"0"},jsx(RadixThemesBox,{css:({ ["flex"] : "1", ["minWidth"] : "0", ["height"] : "100vh" })},jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%", ["height"] : "100vh" }),direction:"column",gap:"0"},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["background"] : "var(--nav-bg)" })},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",justify:"between",gap:"3"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"4"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/"},jsx("img",{css:({ ["width"] : "5em", ["height"] : "auto" }),src:"/images/logo.png"},))),jsx(RadixThemesFlex,{align:"center",gap:"5"},jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_7791ce1263bb1fc828d028f3bd7798d7,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_7e2142eaacfc4e664d63fc92b0517ac8,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_bb99783a5bec6e6089350098953110d9,{},)))),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesBox,{css:({ ["paddingRight"] : "0.5rem" })},jsx(RadixThemesDropdownMenu.Root,{},jsx(RadixThemesDropdownMenu.Trigger,{},jsx(RadixThemesIconButton,{css:({ ["padding"] : "6px", ["color"] : "var(--text-dark)", ["background"] : "var(--bg)", ["&:active"] : ({ ["boxShadow"] : "none" }), ["&:focus"] : ({ ["boxShadow"] : "none", ["outline"] : "none" }) }),radius:"full",size:"3"},jsx(LucideUser,{size:36},))),jsx(RadixThemesDropdownMenu.Content,{},jsx(RadixThemesDropdownMenu.Item,{},"Settings"),jsx(RadixThemesDropdownMenu.Separator,{},),jsx(Dropdownmenu__item_2eb1bc7cebe117a4cfccf6cd9dd34d7d,{},)))))),jsx(RadixThemesBox,{css:({ ["padding"] : ({ ["base"] : "1rem", ["md"] : "2rem" }), ["width"] : "100%", ["height"] : "100%", ["overflow"] : "auto" })},jsx(Fragment_1d27a9abd7849922af5b9bb345d413bf,{},)))))),jsx("title",{},"Bike Analyser"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}