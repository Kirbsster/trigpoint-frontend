import {Fragment,useCallback,useContext,useEffect} from "react"
import {Box as RadixThemesBox,Card as RadixThemesCard,DropdownMenu as RadixThemesDropdownMenu,Flex as RadixThemesFlex,Grid as RadixThemesGrid,Heading as RadixThemesHeading,IconButton as RadixThemesIconButton,Link as RadixThemesLink,Text as RadixThemesText} from "@radix-ui/themes"
import {Link as ReactRouterLink} from "react-router"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,isTrue} from "$/utils/state"
import {Trash2 as LucideTrash2,User as LucideUser} from "lucide-react"
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


function Box_d703e4c517d58fe9aedee8982dfed1cf () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_3ca5ade8b613c784d66aee08ad31e8ac = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___shed_state____shed_state.create_shed_and_go", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["height"] : "100%", ["cursor"] : "pointer" }),onClick:on_click_3ca5ade8b613c784d66aee08ad31e8ac},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center" })},jsx(RadixThemesText,{as:"p",size:"5",weight:"bold"},"+ New shed")))
  )
}


function Flex_e05ca65ce66058b78d7be3307231109c () {
  const reflex___state____state__app___state___shed_state____shed_state = useContext(StateContexts.reflex___state____state__app___state___shed_state____shed_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"row",gap:"3"},Array.prototype.map.call(reflex___state____state__app___state___shed_state____shed_state.sheds_rx_state_ ?? [],((shed_rx_state_,index_dfe5400d2a26875dca9096b63e0f9a49)=>(jsx(RadixThemesCard,{css:({ ["aspectRatio"] : "1 / 1", ["display"] : "flex", ["alignItems"] : "stretch", ["justifyContent"] : "stretch", ["padding"] : "1rem" }),key:index_dfe5400d2a26875dca9096b63e0f9a49},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["height"] : "100%", ["cursor"] : "pointer" }),onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___shed_state____shed_state.goto_shed", ({ ["shed_id"] : shed_rx_state_?.["id"] }), ({  })))], [_e], ({  }))))},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"2"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",gap:"3"},jsx(RadixThemesHeading,{size:"4"},(isTrue(shed_rx_state_?.["name"]) ? shed_rx_state_?.["name"] : "Untitled shed")),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesIconButton,{"aria-label":"Delete shed",css:({ ["padding"] : "6px" }),onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___shed_state____shed_state.delete_shed", ({ ["shed_id"] : shed_rx_state_?.["id"] }), ({ ["stopPropagation"] : true })))], [_e], ({  })))),size:"1",variant:"ghost"},jsx(LucideTrash2,{size:12},))),jsx(RadixThemesText,{as:"p",size:"3"},(isTrue(shed_rx_state_?.["description"]) ? shed_rx_state_?.["description"] : "")),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"row",gap:"3"},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "gray" }),size:"2"},(!(((isTrue(shed_rx_state_?.["visibility"]) ? shed_rx_state_?.["visibility"] : null)?.valueOf?.() === null?.valueOf?.())) ? (isTrue(shed_rx_state_?.["visibility"]) ? shed_rx_state_?.["visibility"] : null) : "private")),jsx(RadixThemesText,{as:"p",css:({ ["color"] : "gray" }),size:"2"},"bikes")))))))),jsx(RadixThemesCard,{css:({ ["aspectRatio"] : "1 / 1", ["display"] : "flex", ["alignItems"] : "stretch", ["justifyContent"] : "stretch", ["padding"] : "1rem" })},jsx(Box_d703e4c517d58fe9aedee8982dfed1cf,{},)))
  )
}


function Grid_5c2dc48dd52352e6f90e1b194c33ae9c () {
  const reflex___state____state__app___state___shed_state____shed_state = useContext(StateContexts.reflex___state____state__app___state___shed_state____shed_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx(RadixThemesGrid,{columns:({ ["sm"] : "4", ["lg"] : "5" }),css:({ ["gap"] : "1rem", ["width"] : "100%" })},Array.prototype.map.call(reflex___state____state__app___state___shed_state____shed_state.sheds_rx_state_ ?? [],((shed_rx_state_,index_dfe5400d2a26875dca9096b63e0f9a49)=>(jsx(RadixThemesCard,{css:({ ["aspectRatio"] : "1 / 1", ["display"] : "flex", ["alignItems"] : "stretch", ["justifyContent"] : "stretch", ["padding"] : "1rem" }),key:index_dfe5400d2a26875dca9096b63e0f9a49},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["height"] : "100%", ["cursor"] : "pointer" }),onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___shed_state____shed_state.goto_shed", ({ ["shed_id"] : shed_rx_state_?.["id"] }), ({  })))], [_e], ({  }))))},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"2"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",gap:"3"},jsx(RadixThemesHeading,{size:"4"},(isTrue(shed_rx_state_?.["name"]) ? shed_rx_state_?.["name"] : "Untitled shed")),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesIconButton,{"aria-label":"Delete shed",css:({ ["padding"] : "6px" }),onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___shed_state____shed_state.delete_shed", ({ ["shed_id"] : shed_rx_state_?.["id"] }), ({ ["stopPropagation"] : true })))], [_e], ({  })))),size:"1",variant:"ghost"},jsx(LucideTrash2,{size:12},))),jsx(RadixThemesText,{as:"p",size:"3"},(isTrue(shed_rx_state_?.["description"]) ? shed_rx_state_?.["description"] : "")),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"row",gap:"3"},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "gray" }),size:"2"},(!(((isTrue(shed_rx_state_?.["visibility"]) ? shed_rx_state_?.["visibility"] : null)?.valueOf?.() === null?.valueOf?.())) ? (isTrue(shed_rx_state_?.["visibility"]) ? shed_rx_state_?.["visibility"] : null) : "private")),jsx(RadixThemesText,{as:"p",css:({ ["color"] : "gray" }),size:"2"},"bikes")))))))),jsx(RadixThemesCard,{css:({ ["aspectRatio"] : "1 / 1", ["display"] : "flex", ["alignItems"] : "stretch", ["justifyContent"] : "stretch", ["padding"] : "1rem" })},jsx(Box_d703e4c517d58fe9aedee8982dfed1cf,{},)))
  )
}


function Fragment_b1d53fdaf68da8e7e23b9de0749de1ae () {
  const reflex___state____state__app___state___shed_state____shed_state = useContext(StateContexts.reflex___state____state__app___state___shed_state____shed_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___shed_state____shed_state.sheds_rx_state_?.valueOf?.() === []?.valueOf?.()))?(jsx(Fragment,{},jsx(RadixThemesBox,{css:({ ["width"] : "100%" })},jsx(RadixThemesBox,{css:({ ["@media screen and (min-width: 0)"] : ({ ["display"] : "block" }), ["@media screen and (min-width: 30em)"] : ({ ["display"] : "block" }), ["@media screen and (min-width: 48em)"] : ({ ["display"] : "block" }), ["@media screen and (min-width: 62em)"] : ({ ["display"] : "none" }) })},jsx(RadixThemesBox,{css:({ ["width"] : "max-content", ["overflowX"] : "auto", ["overflowY"] : "hidden", ["paddingTop"] : "0.5rem", ["paddingBottom"] : "0.5rem" })},jsx(Flex_e05ca65ce66058b78d7be3307231109c,{},))),jsx(RadixThemesBox,{css:({ ["@media screen and (min-width: 0)"] : ({ ["display"] : "none" }), ["@media screen and (min-width: 30em)"] : ({ ["display"] : "none" }), ["@media screen and (min-width: 48em)"] : ({ ["display"] : "none" }), ["@media screen and (min-width: 62em)"] : ({ ["display"] : "block" }) })},jsx(Grid_5c2dc48dd52352e6f90e1b194c33ae9c,{},))))):(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"3"},jsx(RadixThemesText,{as:"p",size:"3"},"You have no bike sheds yet. Create your first shed."),jsx(RadixThemesBox,{css:({ ["width"] : "100%" })},jsx(RadixThemesBox,{css:({ ["@media screen and (min-width: 0)"] : ({ ["display"] : "block" }), ["@media screen and (min-width: 30em)"] : ({ ["display"] : "block" }), ["@media screen and (min-width: 48em)"] : ({ ["display"] : "block" }), ["@media screen and (min-width: 62em)"] : ({ ["display"] : "none" }) })},jsx(RadixThemesBox,{css:({ ["width"] : "max-content", ["overflowX"] : "auto", ["overflowY"] : "hidden", ["paddingTop"] : "0.5rem", ["paddingBottom"] : "0.5rem" })},jsx(Flex_e05ca65ce66058b78d7be3307231109c,{},))),jsx(RadixThemesBox,{css:({ ["@media screen and (min-width: 0)"] : ({ ["display"] : "none" }), ["@media screen and (min-width: 30em)"] : ({ ["display"] : "none" }), ["@media screen and (min-width: 48em)"] : ({ ["display"] : "none" }), ["@media screen and (min-width: 62em)"] : ({ ["display"] : "block" }) })},jsx(Grid_5c2dc48dd52352e6f90e1b194c33ae9c,{},))))))))
  )
}


function Fragment_791d874fcf963c103199e31883cef4da () {
  const reflex___state____state__app___state___shed_state____shed_state = useContext(StateContexts.reflex___state____state__app___state___shed_state____shed_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___shed_state____shed_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesText,{as:"p"},"Loading sheds..."))):(jsx(Fragment_b1d53fdaf68da8e7e23b9de0749de1ae,{},))))
  )
}


function Text_8829e3125445e6e721711104aafbe2b9 () {
  const reflex___state____state__app___state___shed_state____shed_state = useContext(StateContexts.reflex___state____state__app___state___shed_state____shed_state)



  return (
    jsx(RadixThemesText,{as:"p",css:({ ["color"] : "red" })},reflex___state____state__app___state___shed_state____shed_state.message_rx_state_)
  )
}


function Fragment_c98250963e5759cf8550974ed1364a5c () {
  const reflex___state____state__app___state___shed_state____shed_state = useContext(StateContexts.reflex___state____state__app___state___shed_state____shed_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___shed_state____shed_state.message_rx_state_?.valueOf?.() === ""?.valueOf?.()))?(jsx(Fragment,{},jsx(Text_8829e3125445e6e721711104aafbe2b9,{},))):(jsx(Fragment,{},))))
  )
}


function Fragment_3c606fc9131dffe7697fa508ab795471 () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___state___auth_state____auth_state.access_token_rx_state_)?(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"4"},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center", ["width"] : "100%" }),direction:"row",gap:"3"},jsx(RadixThemesHeading,{size:"6"},"My bike sheds"),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},)),jsx(Fragment_791d874fcf963c103199e31883cef4da,{},),jsx(Fragment_c98250963e5759cf8550974ed1364a5c,{},)))):(jsx(Fragment,{},jsx(RadixThemesBox,{},)))))
  )
}


function Fragment_fa4770f17ba08d40cded4f2ca88ce0a6 () {
  const reflex___state____state__app___state___page_state____page_state = useContext(StateContexts.reflex___state____state__app___state___page_state____page_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___page_state____page_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["width"] : "100%", ["height"] : "100%", ["padding"] : "2rem" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"column",gap:"2"},jsx(Text_9d3a7751e97881a128bab8621a2a3c6a,{},),jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--gray-9)" }),size:"2"},"Please wait"))))):(jsx(Fragment_3c606fc9131dffe7697fa508ab795471,{},))))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack page",css:({ ["height"] : "100vh" }),direction:"row",gap:"0"},jsx(RadixThemesBox,{css:({ ["flex"] : "1", ["minWidth"] : "0", ["height"] : "100vh" })},jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%", ["height"] : "100vh" }),direction:"column",gap:"0"},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["background"] : "var(--nav-bg)" })},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",justify:"between",gap:"3"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"4"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/"},jsx("img",{css:({ ["width"] : "5em", ["height"] : "auto" }),src:"/images/logo.png"},))),jsx(RadixThemesFlex,{align:"center",gap:"5"},jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_7791ce1263bb1fc828d028f3bd7798d7,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_1d74b99674d8c36d8cabb849062dc326,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_bb99783a5bec6e6089350098953110d9,{},)))),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesDropdownMenu.Root,{},jsx(RadixThemesDropdownMenu.Trigger,{},jsx(RadixThemesIconButton,{css:({ ["padding"] : "6px", ["background"] : "var(--accent)" }),radius:"full",size:"2"},jsx(LucideUser,{size:24},))),jsx(RadixThemesDropdownMenu.Content,{},jsx(RadixThemesDropdownMenu.Item,{},"Settings"),jsx(RadixThemesDropdownMenu.Separator,{},),jsx(Dropdownmenu__item_2eb1bc7cebe117a4cfccf6cd9dd34d7d,{},))))),jsx(RadixThemesBox,{css:({ ["padding"] : ({ ["base"] : "1rem", ["md"] : "2rem" }), ["width"] : "100%", ["height"] : "100%", ["overflow"] : "auto" })},jsx(Fragment_fa4770f17ba08d40cded4f2ca88ce0a6,{},)))))),jsx("title",{},"Bike Sheds"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}