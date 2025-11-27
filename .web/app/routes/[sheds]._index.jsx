import {Fragment,useCallback,useContext,useEffect} from "react"
import {Box as RadixThemesBox,Button as RadixThemesButton,Card as RadixThemesCard,DropdownMenu as RadixThemesDropdownMenu,Flex as RadixThemesFlex,Heading as RadixThemesHeading,IconButton as RadixThemesIconButton,Link as RadixThemesLink,Select as RadixThemesSelect,Text as RadixThemesText,TextArea as RadixThemesTextArea,TextField as RadixThemesTextField} from "@radix-ui/themes"
import {Link as ReactRouterLink} from "react-router"
import {User as LucideUser} from "lucide-react"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,isNotNullOrUndefined,isTrue} from "$/utils/state"
import DebounceInput from "react-debounce-input"
import {jsx} from "@emotion/react"




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


function Debounceinput_39b6400fcdef78d03e93ea227663fe5f () {
  const reflex___state____state__app___state___shed_state____shed_state = useContext(StateContexts.reflex___state____state__app___state___shed_state____shed_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_2e2858d863f3465d8ee8dd2fbeef3ebc = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___shed_state____shed_state.set_name", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{css:({ ["width"] : "100%" }),debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_2e2858d863f3465d8ee8dd2fbeef3ebc,placeholder:"Shed name",value:(isNotNullOrUndefined(reflex___state____state__app___state___shed_state____shed_state.name_rx_state_) ? reflex___state____state__app___state___shed_state____shed_state.name_rx_state_ : "")},)
  )
}


function Debounceinput_e8adae3405c8f59161822fd0c9f04b80 () {
  const reflex___state____state__app___state___shed_state____shed_state = useContext(StateContexts.reflex___state____state__app___state___shed_state____shed_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_ed7a05b30bdb01086ec96f2949a00f70 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___shed_state____shed_state.set_description", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{css:({ ["width"] : "100%" }),debounceTimeout:300,element:RadixThemesTextArea,onChange:on_change_ed7a05b30bdb01086ec96f2949a00f70,placeholder:"Optional description",rows:"3",value:reflex___state____state__app___state___shed_state____shed_state.description_rx_state_},)
  )
}


function Select__root_5b03ef7672b44a41a48ff27fabc0916c () {
  const reflex___state____state__app___state___shed_state____shed_state = useContext(StateContexts.reflex___state____state__app___state___shed_state____shed_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_93a8287df79c5c9c13666bbc4a73dcf8 = useCallback(((_ev_0) => (addEvents([(ReflexEvent("reflex___state____state.app___state___shed_state____shed_state.set_visibility", ({ ["value"] : _ev_0 }), ({  })))], [_ev_0], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesSelect.Root,{onValueChange:on_change_93a8287df79c5c9c13666bbc4a73dcf8,value:reflex___state____state__app___state___shed_state____shed_state.visibility_rx_state_},jsx(RadixThemesSelect.Trigger,{css:({ ["width"] : "100%" })},),jsx(RadixThemesSelect.Content,{},jsx(RadixThemesSelect.Group,{},jsx(RadixThemesSelect.Label,{},"Visibility"),jsx(RadixThemesSelect.Item,{value:"private"},"private"),jsx(RadixThemesSelect.Item,{value:"unlisted"},"unlisted"),jsx(RadixThemesSelect.Item,{value:"public"},"public"))))
  )
}


function Button_fa712c665c99e81b2f7716f2f342c413 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_c8ad4fdf122e19559492b848bd92fd88 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___shed_state____shed_state.create_shed", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{css:({ ["width"] : "100%" }),onClick:on_click_c8ad4fdf122e19559492b848bd92fd88},"Create shed")
  )
}


function Flex_64ac47151d9cb3a9e67da2589f64a9f5 () {
  const reflex___state____state__app___state___shed_state____shed_state = useContext(StateContexts.reflex___state____state__app___state___shed_state____shed_state)



  return (
    jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"3"},Array.prototype.map.call(reflex___state____state__app___state___shed_state____shed_state.sheds_rx_state_ ?? [],((shed_rx_state_,index_79d9b80330180bbcf8d0bf930904e834)=>(jsx(RadixThemesCard,{css:({ ["width"] : "100%" }),key:index_79d9b80330180bbcf8d0bf930904e834},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "flex-start", ["width"] : "100%" }),direction:"column",gap:"2"},jsx(RadixThemesHeading,{size:"4"},(isTrue(shed_rx_state_?.["name"]) ? shed_rx_state_?.["name"] : "Untitled shed")),jsx(RadixThemesText,{as:"p",size:"3"},(isTrue(shed_rx_state_?.["description"]) ? shed_rx_state_?.["description"] : "")),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"row",gap:"3"},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "gray" }),size:"2"},(!(((isTrue(shed_rx_state_?.["visibility"]) ? shed_rx_state_?.["visibility"] : null)?.valueOf?.() === null?.valueOf?.())) ? (isTrue(shed_rx_state_?.["visibility"]) ? shed_rx_state_?.["visibility"] : null) : "private")),jsx(RadixThemesText,{as:"p",size:"2"},"bikes"))))))),jsx(RadixThemesCard,{css:({ ["width"] : "100%" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"3"},jsx(RadixThemesHeading,{size:"4"},"+ New shed"),jsx(Debounceinput_39b6400fcdef78d03e93ea227663fe5f,{},),jsx(Debounceinput_e8adae3405c8f59161822fd0c9f04b80,{},),jsx(Select__root_5b03ef7672b44a41a48ff27fabc0916c,{},),jsx(Button_fa712c665c99e81b2f7716f2f342c413,{},))))
  )
}


function Fragment_fe1977a7f4ceb09a3e2688787c98bcd5 () {
  const reflex___state____state__app___state___shed_state____shed_state = useContext(StateContexts.reflex___state____state__app___state___shed_state____shed_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___shed_state____shed_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesText,{as:"p"},"Loading sheds..."))):(jsx(Fragment,{},jsx(Flex_64ac47151d9cb3a9e67da2589f64a9f5,{},)))))
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


function Fragment_a43223219fa3cd4a1615d3a67635473b () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___state___auth_state____auth_state.access_token_rx_state_)?(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"4"},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center", ["width"] : "100%" }),direction:"row",gap:"3"},jsx(RadixThemesHeading,{size:"6"},"My bike sheds"),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},)),jsx(Fragment_fe1977a7f4ceb09a3e2688787c98bcd5,{},),jsx(Fragment_c98250963e5759cf8550974ed1364a5c,{},)))):(jsx(Fragment,{},jsx(RadixThemesBox,{},)))))
  )
}


function Fragment_724fca4b411a2b07f4f74d2d0714f08c () {
  const reflex___state____state__app___state___page_state____page_state = useContext(StateContexts.reflex___state____state__app___state___page_state____page_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___page_state____page_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["width"] : "100%", ["height"] : "100%", ["padding"] : "2rem" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"column",gap:"2"},jsx(Text_9d3a7751e97881a128bab8621a2a3c6a,{},),jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--gray-9)" }),size:"2"},"Please wait"))))):(jsx(Fragment_a43223219fa3cd4a1615d3a67635473b,{},))))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack page",css:({ ["height"] : "100vh" }),direction:"row",gap:"0"},jsx(RadixThemesBox,{css:({ ["flex"] : "1", ["minWidth"] : "0", ["height"] : "100vh" })},jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%", ["height"] : "100vh" }),direction:"column",gap:"0"},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["background"] : "var(--nav-bg)" })},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",justify:"between",gap:"3"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"4"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/"},jsx("img",{css:({ ["width"] : "5em", ["height"] : "auto" }),src:"/images/logo.png"},))),jsx(RadixThemesFlex,{align:"center",gap:"5"},jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/news"},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--text)" }),size:"5"},"News")))),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/shed"},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--text)" }),size:"5"},"Bike Shed")))))),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesDropdownMenu.Root,{},jsx(RadixThemesDropdownMenu.Trigger,{},jsx(RadixThemesIconButton,{css:({ ["padding"] : "6px", ["background"] : "var(--accent)" }),radius:"full",size:"2"},jsx(LucideUser,{size:24},))),jsx(RadixThemesDropdownMenu.Content,{},jsx(RadixThemesDropdownMenu.Item,{},"Settings"),jsx(RadixThemesDropdownMenu.Separator,{},),jsx(Dropdownmenu__item_2eb1bc7cebe117a4cfccf6cd9dd34d7d,{},))))),jsx(RadixThemesBox,{css:({ ["padding"] : ({ ["base"] : "1rem", ["md"] : "2rem" }), ["width"] : "100%", ["height"] : "100%", ["overflow"] : "auto" })},jsx(Fragment_724fca4b411a2b07f4f74d2d0714f08c,{},)))))),jsx("title",{},"Bike Sheds"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}