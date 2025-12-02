import {Fragment,useCallback,useContext,useEffect} from "react"
import {Box as RadixThemesBox,Button as RadixThemesButton,Card as RadixThemesCard,DropdownMenu as RadixThemesDropdownMenu,Flex as RadixThemesFlex,Heading as RadixThemesHeading,IconButton as RadixThemesIconButton,Link as RadixThemesLink,Text as RadixThemesText} from "@radix-ui/themes"
import {Link as ReactRouterLink} from "react-router"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,isTrue} from "$/utils/state"
import {User as LucideUser} from "lucide-react"
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


function Flex_6aca28e9d04b9be03c312f7541bc3d59 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"3"},Array.prototype.map.call(reflex___state____state__app___state___bike_state____bike_state.bikes_rx_state_ ?? [],((bike_rx_state_,index_b0f21f5c30a8e2ff2642303171a08e5c)=>(jsx(RadixThemesCard,{css:({ ["width"] : "100%" }),key:index_b0f21f5c30a8e2ff2642303171a08e5c},jsx(RadixThemesLink,{css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) }),href:"#",onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.goto_bike", ({ ["bike_id"] : bike_rx_state_?.["id"] }), ({  })))], [_e], ({  }))))},jsx(Fragment,{},(!(((isTrue(bike_rx_state_?.["hero_url"]) ? bike_rx_state_?.["hero_url"] : null)?.valueOf?.() === null?.valueOf?.()))?(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center", ["width"] : "100%" }),direction:"row",gap:"3"},jsx("img",{css:({ ["width"] : "140px", ["height"] : "140px", ["objectFit"] : "cover", ["borderRadius"] : "0.75rem" }),src:(isTrue(bike_rx_state_?.["hero_url"]) ? bike_rx_state_?.["hero_url"] : "")},),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "flex-start", ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesHeading,{size:"4"},(isTrue(bike_rx_state_?.["name"]) ? bike_rx_state_?.["name"] : "Untitled")),jsx(RadixThemesText,{as:"p",size:"3"},(isTrue(bike_rx_state_?.["brand"]) ? bike_rx_state_?.["brand"] : "")),jsx(RadixThemesText,{as:"p",size:"2"},("Model year: "+(isTrue(bike_rx_state_?.["model_year"]) ? bike_rx_state_?.["model_year"] : null))))))):(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "flex-start", ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesHeading,{size:"4"},(isTrue(bike_rx_state_?.["name"]) ? bike_rx_state_?.["name"] : "Untitled")),jsx(RadixThemesText,{as:"p",size:"3"},(isTrue(bike_rx_state_?.["brand"]) ? bike_rx_state_?.["brand"] : "")),jsx(RadixThemesText,{as:"p",size:"2"},("Model year: "+(isTrue(bike_rx_state_?.["model_year"]) ? bike_rx_state_?.["model_year"] : null))))))))))))))
  )
}


function Fragment_e67bbd33fb06861e34400ca5b46d6cc4 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___bike_state____bike_state.has_bikes_rx_state_?(jsx(Fragment,{},jsx(Flex_6aca28e9d04b9be03c312f7541bc3d59,{},))):(jsx(Fragment,{},jsx(RadixThemesText,{as:"p",size:"3"},"You have no bikes yet. Add one!")))))
  )
}


function Fragment_2d8f1feb9c2f30142e7b0e47f82ce92b () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___bike_state____bike_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesText,{as:"p"},"Loading bikes..."))):(jsx(Fragment_e67bbd33fb06861e34400ca5b46d6cc4,{},))))
  )
}


function Text_66c079d8c1159a72b02b2961f378b420 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(RadixThemesText,{as:"p",css:({ ["color"] : "red" })},reflex___state____state__app___state___bike_state____bike_state.message_rx_state_)
  )
}


function Fragment_3079a1292be83b46f5493f26a73f08e2 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___bike_state____bike_state.message_rx_state_?.valueOf?.() === ""?.valueOf?.()))?(jsx(Fragment,{},jsx(Text_66c079d8c1159a72b02b2961f378b420,{},))):(jsx(Fragment,{},))))
  )
}


function Fragment_92c71a0762611a742a22109c78ee6587 () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___state___auth_state____auth_state.access_token_rx_state_)?(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"4"},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center", ["width"] : "100%" }),direction:"row",gap:"3"},jsx(RadixThemesHeading,{size:"6"},"My bikes"),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesButton,{},"+ Add bike")),jsx(Fragment_2d8f1feb9c2f30142e7b0e47f82ce92b,{},),jsx(Fragment_3079a1292be83b46f5493f26a73f08e2,{},)))):(jsx(Fragment,{},jsx(RadixThemesBox,{},)))))
  )
}


function Fragment_7d5f3c4276e8710f916a2e7e0833fbfe () {
  const reflex___state____state__app___state___page_state____page_state = useContext(StateContexts.reflex___state____state__app___state___page_state____page_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___page_state____page_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["width"] : "100%", ["height"] : "100%", ["padding"] : "2rem" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"column",gap:"2"},jsx(Text_9d3a7751e97881a128bab8621a2a3c6a,{},),jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--gray-9)" }),size:"2"},"Please wait"))))):(jsx(Fragment_92c71a0762611a742a22109c78ee6587,{},))))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack page",css:({ ["height"] : "100vh" }),direction:"row",gap:"0"},jsx(RadixThemesBox,{css:({ ["flex"] : "1", ["minWidth"] : "0", ["height"] : "100vh" })},jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%", ["height"] : "100vh" }),direction:"column",gap:"0"},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["background"] : "var(--nav-bg)" })},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",justify:"between",gap:"3"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"4"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/"},jsx("img",{css:({ ["width"] : "5em", ["height"] : "auto" }),src:"/images/logo.png"},))),jsx(RadixThemesFlex,{align:"center",gap:"5"},jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_7791ce1263bb1fc828d028f3bd7798d7,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_1d74b99674d8c36d8cabb849062dc326,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_bb99783a5bec6e6089350098953110d9,{},)))),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesDropdownMenu.Root,{},jsx(RadixThemesDropdownMenu.Trigger,{},jsx(RadixThemesIconButton,{css:({ ["padding"] : "6px", ["background"] : "var(--accent)" }),radius:"full",size:"2"},jsx(LucideUser,{size:24},))),jsx(RadixThemesDropdownMenu.Content,{},jsx(RadixThemesDropdownMenu.Item,{},"Settings"),jsx(RadixThemesDropdownMenu.Separator,{},),jsx(Dropdownmenu__item_2eb1bc7cebe117a4cfccf6cd9dd34d7d,{},))))),jsx(RadixThemesBox,{css:({ ["padding"] : ({ ["base"] : "1rem", ["md"] : "2rem" }), ["width"] : "100%", ["height"] : "100%", ["overflow"] : "auto" })},jsx(Fragment_7d5f3c4276e8710f916a2e7e0833fbfe,{},)))))),jsx("title",{},"My bikes"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}