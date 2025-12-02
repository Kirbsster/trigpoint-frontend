import {Fragment,useCallback,useContext,useEffect,useRef} from "react"
import {Box as RadixThemesBox,Button as RadixThemesButton,Card as RadixThemesCard,DropdownMenu as RadixThemesDropdownMenu,Flex as RadixThemesFlex,IconButton as RadixThemesIconButton,Link as RadixThemesLink,Text as RadixThemesText} from "@radix-ui/themes"
import {Link as ReactRouterLink} from "react-router"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,isTrue,refs} from "$/utils/state"
import {Activity as LucideActivity,CircleDot as LucideCircleDot,Move3D as LucideMove3D,Pin as LucidePin,RotateCcw as LucideRotateCcw,Square as LucideSquare,Target as LucideTarget,User as LucideUser} from "lucide-react"
import {Helmet} from "react-helmet"
import {jsx} from "@emotion/react"




function Link_7791ce1263bb1fc828d028f3bd7798d7 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_8cba84e1b6dd8ea1633c1e12cab646fc = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___page_state____page_state.goto", ({ ["path"] : "/news", ["message"] : "Loading news..." }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) }),onClick:on_click_8cba84e1b6dd8ea1633c1e12cab646fc},jsx(ReactRouterLink,{to:"/news"},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--text)" }),size:"5"},"News")))
  )
}


function Link_1d74b99674d8c36d8cabb849062dc326 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_2d1a3bfdc9e675d81da1d31430e0dd42 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___page_state____page_state.goto", ({ ["path"] : "/bikes", ["message"] : "Loading bikes..." }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) }),onClick:on_click_2d1a3bfdc9e675d81da1d31430e0dd42},jsx(ReactRouterLink,{to:"/bikes"},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--text)" }),size:"5"},"Bikes")))
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


function Iconbutton_974b627dd6f3354975e143a219e08e3a () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_c2d06885d42877f7a3755c462fcf57d0 = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "(() => { const c = document.getElementById(\"bike-viewer-container\"); if (c && c.bikeViewer && c.bikeViewer.resetView) { c.bikeViewer.resetView(); } })();", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesIconButton,{color:"gray",css:({ ["padding"] : "6px", ["borderRadius"] : "full", ["position"] : "absolute", ["bottom"] : "16px", ["left"] : "50%", ["transform"] : "translateX(-50%)", ["zIndex"] : "10", ["opacity"] : "0.85", ["&:hover"] : ({ ["opacity"] : "1" }) }),onClick:on_click_c2d06885d42877f7a3755c462fcf57d0,size:"3",variant:"solid"},jsx(LucideRotateCcw,{size:36},))
  )
}


function Button_0ad5e6774ae47fa22e219b775a1a0a65 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_0a2c76f2895e21764d3ddd0a2148dc16 = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "(() => { const c = document.getElementById(\"bike-viewer-container\"); if (c && c.bikeViewer && c.bikeViewer.setType) { c.bikeViewer.setType(\"frame\"); } })();", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"point-type-btn",css:({ ["color"] : "var(--accent)", ["justifyContent"] : "flex-start", ["width"] : "140px", ["paddingInlineStart"] : "0.5rem", ["paddingInlineEnd"] : "0.5rem", ["paddingTop"] : "0.35rem", ["paddingBottom"] : "0.35rem", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "all 0.15s ease", ["&:hover"] : ({ ["background"] : "rgba(255,255,255,0.08)", ["borderColor"] : "rgba(0,229,255,0.8)", ["transform"] : "translateX(-3px)" }), ["&:active"] : ({ ["transform"] : "scale(0.98)" }) }),"data-point-type":"frame",onClick:on_click_0a2c76f2895e21764d3ddd0a2148dc16,size:"2",variant:"soft"},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"row",gap:"1"},jsx(LucideSquare,{},),jsx(RadixThemesText,{as:"p"},"Frame point")))
  )
}


function Button_808301be0ef8d6c4406d29d4728b8b7e () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_7dab6cd0ab07082bdfd9a04e599a2971 = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "(() => { const c = document.getElementById(\"bike-viewer-container\"); if (c && c.bikeViewer && c.bikeViewer.setType) { c.bikeViewer.setType(\"free\"); } })();", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"point-type-btn",css:({ ["color"] : "var(--accent)", ["justifyContent"] : "flex-start", ["width"] : "140px", ["paddingInlineStart"] : "0.5rem", ["paddingInlineEnd"] : "0.5rem", ["paddingTop"] : "0.35rem", ["paddingBottom"] : "0.35rem", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "all 0.15s ease", ["&:hover"] : ({ ["background"] : "rgba(255,255,255,0.08)", ["borderColor"] : "rgba(0,229,255,0.8)", ["transform"] : "translateX(-3px)" }), ["&:active"] : ({ ["transform"] : "scale(0.98)" }) }),"data-point-type":"free",onClick:on_click_7dab6cd0ab07082bdfd9a04e599a2971,size:"2",variant:"soft"},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"row",gap:"1"},jsx(LucideMove3D,{},),jsx(RadixThemesText,{as:"p"},"Free pivot")))
  )
}


function Button_18171632326f5c99cefd25ac552a3833 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_5920da63995aea78121d70b7dccb6c7f = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "(() => { const c = document.getElementById(\"bike-viewer-container\"); if (c && c.bikeViewer && c.bikeViewer.setType) { c.bikeViewer.setType(\"fixed\"); } })();", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"point-type-btn",css:({ ["color"] : "var(--accent)", ["justifyContent"] : "flex-start", ["width"] : "140px", ["paddingInlineStart"] : "0.5rem", ["paddingInlineEnd"] : "0.5rem", ["paddingTop"] : "0.35rem", ["paddingBottom"] : "0.35rem", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "all 0.15s ease", ["&:hover"] : ({ ["background"] : "rgba(255,255,255,0.08)", ["borderColor"] : "rgba(0,229,255,0.8)", ["transform"] : "translateX(-3px)" }), ["&:active"] : ({ ["transform"] : "scale(0.98)" }) }),"data-point-type":"fixed",onClick:on_click_5920da63995aea78121d70b7dccb6c7f,size:"2",variant:"soft"},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"row",gap:"1"},jsx(LucidePin,{},),jsx(RadixThemesText,{as:"p"},"Fixed pivot")))
  )
}


function Button_9e44b5c2ddf810fb724e41ff212f324a () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_082456f195fcb419747d1e5549ee3a05 = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "(() => { const c = document.getElementById(\"bike-viewer-container\"); if (c && c.bikeViewer && c.bikeViewer.setType) { c.bikeViewer.setType(\"shock\"); } })();", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"point-type-btn",css:({ ["color"] : "var(--accent)", ["justifyContent"] : "flex-start", ["width"] : "140px", ["paddingInlineStart"] : "0.5rem", ["paddingInlineEnd"] : "0.5rem", ["paddingTop"] : "0.35rem", ["paddingBottom"] : "0.35rem", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "all 0.15s ease", ["&:hover"] : ({ ["background"] : "rgba(255,255,255,0.08)", ["borderColor"] : "rgba(0,229,255,0.8)", ["transform"] : "translateX(-3px)" }), ["&:active"] : ({ ["transform"] : "scale(0.98)" }) }),"data-point-type":"shock",onClick:on_click_082456f195fcb419747d1e5549ee3a05,size:"2",variant:"soft"},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"row",gap:"1"},jsx(LucideActivity,{},),jsx(RadixThemesText,{as:"p"},"Shock pivot")))
  )
}


function Button_ff424a4777a64a5c51d7d07a5916c570 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_4f8751ff65edb2a415b8bea80ff4db24 = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "(() => { const c = document.getElementById(\"bike-viewer-container\"); if (c && c.bikeViewer && c.bikeViewer.setType) { c.bikeViewer.setType(\"front_axle\"); } })();", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"point-type-btn",css:({ ["color"] : "var(--accent)", ["justifyContent"] : "flex-start", ["width"] : "140px", ["paddingInlineStart"] : "0.5rem", ["paddingInlineEnd"] : "0.5rem", ["paddingTop"] : "0.35rem", ["paddingBottom"] : "0.35rem", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "all 0.15s ease", ["&:hover"] : ({ ["background"] : "rgba(255,255,255,0.08)", ["borderColor"] : "rgba(0,229,255,0.8)", ["transform"] : "translateX(-3px)" }), ["&:active"] : ({ ["transform"] : "scale(0.98)" }) }),"data-point-type":"front_axle",onClick:on_click_4f8751ff65edb2a415b8bea80ff4db24,size:"2",variant:"soft"},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"row",gap:"1"},jsx(LucideCircleDot,{},),jsx(RadixThemesText,{as:"p"},"Front axle")))
  )
}


function Button_5fd54bc945f5ca1d843a14557018fbe1 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_fecf17ec1f2aa07e70af0e0367fe708d = useCallback(((_e) => (addEvents([(ReflexEvent("_call_script", ({ ["javascript_code"] : "(() => { const c = document.getElementById(\"bike-viewer-container\"); if (c && c.bikeViewer && c.bikeViewer.setType) { c.bikeViewer.setType(\"rear_axle\"); } })();", ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{className:"point-type-btn",css:({ ["color"] : "var(--accent)", ["justifyContent"] : "flex-start", ["width"] : "140px", ["paddingInlineStart"] : "0.5rem", ["paddingInlineEnd"] : "0.5rem", ["paddingTop"] : "0.35rem", ["paddingBottom"] : "0.35rem", ["borderRadius"] : "999px", ["cursor"] : "pointer", ["transition"] : "all 0.15s ease", ["&:hover"] : ({ ["background"] : "rgba(255,255,255,0.08)", ["borderColor"] : "rgba(0,229,255,0.8)", ["transform"] : "translateX(-3px)" }), ["&:active"] : ({ ["transform"] : "scale(0.98)" }) }),"data-point-type":"rear_axle",onClick:on_click_fecf17ec1f2aa07e70af0e0367fe708d,size:"2",variant:"soft"},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"row",gap:"1"},jsx(LucideTarget,{},),jsx(RadixThemesText,{as:"p"},"Rear axle")))
  )
}


function Fragment_3943b7c03761049c3aa0d77428b167e2 () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)
const ref_bike_viewer_container = useRef(null); refs["ref_bike_viewer_container"] = ref_bike_viewer_container;
const ref_bike_viewer_inner = useRef(null); refs["ref_bike_viewer_inner"] = ref_bike_viewer_inner;



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___state___auth_state____auth_state.access_token_rx_state_)?(jsx(Fragment,{},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["height"] : "100%", ["position"] : "relative", ["overflow"] : "visible" })},jsx(Helmet,{},jsx("script",{src:"/js/bike_points_viewer.js"},)),jsx(RadixThemesBox,{css:({ ["background"] : "var(--bg)", ["width"] : "100%", ["height"] : "100%", ["position"] : "relative", ["overflow"] : "hidden" }),id:"bike-viewer-container",ref:ref_bike_viewer_container},jsx(RadixThemesBox,{css:({ ["position"] : "relative", ["width"] : "100%", ["height"] : "100%" }),id:"bike-viewer-inner",ref:ref_bike_viewer_inner},jsx(Fragment_c73d67842ea9b7a66a3601a5e657a099,{},),jsx(Iconbutton_974b627dd6f3354975e143a219e08e3a,{},))),jsx(RadixThemesBox,{css:({ ["position"] : "absolute", ["top"] : "16px", ["right"] : "8px", ["display"] : "flex", ["flexDirection"] : "column", ["gap"] : "0.4rem", ["zIndex"] : "20", ["pointerEvents"] : "auto" })},jsx(Button_0ad5e6774ae47fa22e219b775a1a0a65,{},),jsx(Button_808301be0ef8d6c4406d29d4728b8b7e,{},),jsx(Button_18171632326f5c99cefd25ac552a3833,{},),jsx(Button_9e44b5c2ddf810fb724e41ff212f324a,{},),jsx(Button_ff424a4777a64a5c51d7d07a5916c570,{},),jsx(Button_5fd54bc945f5ca1d843a14557018fbe1,{},))))):(jsx(Fragment,{},jsx(RadixThemesBox,{},)))))
  )
}


function Fragment_e8e398656829fd585a1b58c752851480 () {
  const reflex___state____state__app___state___page_state____page_state = useContext(StateContexts.reflex___state____state__app___state___page_state____page_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___page_state____page_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["width"] : "100%", ["height"] : "100%", ["padding"] : "2rem" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"column",gap:"2"},jsx(Text_9d3a7751e97881a128bab8621a2a3c6a,{},),jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--gray-9)" }),size:"2"},"Please wait"))))):(jsx(Fragment_3943b7c03761049c3aa0d77428b167e2,{},))))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack page",css:({ ["height"] : "100vh" }),direction:"row",gap:"0"},jsx(RadixThemesBox,{css:({ ["flex"] : "1", ["minWidth"] : "0", ["height"] : "100vh" })},jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%", ["height"] : "100vh" }),direction:"column",gap:"0"},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["background"] : "var(--nav-bg)" })},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",justify:"between",gap:"3"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"4"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/"},jsx("img",{css:({ ["width"] : "5em", ["height"] : "auto" }),src:"/images/logo.png"},))),jsx(RadixThemesFlex,{align:"center",gap:"5"},jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_7791ce1263bb1fc828d028f3bd7798d7,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_1d74b99674d8c36d8cabb849062dc326,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_bb99783a5bec6e6089350098953110d9,{},)))),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesDropdownMenu.Root,{},jsx(RadixThemesDropdownMenu.Trigger,{},jsx(RadixThemesIconButton,{css:({ ["padding"] : "6px", ["background"] : "var(--accent)" }),radius:"full",size:"2"},jsx(LucideUser,{size:24},))),jsx(RadixThemesDropdownMenu.Content,{},jsx(RadixThemesDropdownMenu.Item,{},"Settings"),jsx(RadixThemesDropdownMenu.Separator,{},),jsx(Dropdownmenu__item_2eb1bc7cebe117a4cfccf6cd9dd34d7d,{},))))),jsx(RadixThemesBox,{css:({ ["padding"] : ({ ["base"] : "1rem", ["md"] : "2rem" }), ["width"] : "100%", ["height"] : "100%", ["overflow"] : "auto" })},jsx(Fragment_e8e398656829fd585a1b58c752851480,{},)))))),jsx("title",{},"Bike Analyser"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}