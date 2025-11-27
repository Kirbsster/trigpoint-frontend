import {Fragment,useCallback,useContext,useEffect} from "react"
import {Box as RadixThemesBox,Card as RadixThemesCard,DropdownMenu as RadixThemesDropdownMenu,Flex as RadixThemesFlex,IconButton as RadixThemesIconButton,Link as RadixThemesLink,Text as RadixThemesText} from "@radix-ui/themes"
import {Link as ReactRouterLink} from "react-router"
import {User as LucideUser} from "lucide-react"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,isTrue} from "$/utils/state"
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


function Text_84bae511cc7fa63ffd0934c3d6747d2e () {
  const reflex___state____state__app___state___mouse_state____mouse_state = useContext(StateContexts.reflex___state____state__app___state___mouse_state____mouse_state)



  return (
    jsx(RadixThemesText,{as:"p",css:({ ["fontSize"] : "0.7rem", ["color"] : "var(--text)", ["marginTop"] : "0.5rem", ["marginBottom"] : "1rem" })},reflex___state____state__app___state___mouse_state____mouse_state.debug_xy_rx_state_)
  )
}


function Img_32c169f846e8f478dec326024d06f48f () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_mouse_move_af034a1ca3e4f33db3e7e7a851157a42 = useCallback(((...args) => (addEvents([(ReflexEvent("reflex___state____state.app___state___mouse_state____mouse_state.get_pointer_xy", ({  }), ({ ["throttle"] : 16 })))], args, ({  })))), [addEvents, ReflexEvent])

  return (
    jsx("img",{css:({ ["width"] : "100%", ["height"] : "100%", ["objectFit"] : "contain" }),onMouseMove:on_mouse_move_af034a1ca3e4f33db3e7e7a851157a42,src:(isTrue(reflex___state____state__app___state___bike_state____bike_state.current_bike_rx_state_?.["hero_url"]) ? reflex___state____state__app___state___bike_state____bike_state.current_bike_rx_state_?.["hero_url"] : "")},)
  )
}


function Fragment_628398561027dd6281d08845e73fad06 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___bike_state____bike_state.current_bike_rx_state_?.valueOf?.() === ({  })?.valueOf?.()))?(jsx(Fragment,{},jsx(Img_32c169f846e8f478dec326024d06f48f,{},))):(jsx(Fragment,{},jsx(RadixThemesText,{as:"p",size:"4"},"Bike not found")))))
  )
}


function Fragment_4ba673c223cfb89910a0b8d5258c1909 () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___state___auth_state____auth_state.access_token_rx_state_)?(jsx(Fragment,{},jsx(RadixThemesBox,{css:({ ["background"] : "var(--bg)", ["width"] : "100%", ["height"] : "100%", ["position"] : "relative", ["overflow"] : "visible" })},jsx(Text_84bae511cc7fa63ffd0934c3d6747d2e,{},),jsx(Fragment_628398561027dd6281d08845e73fad06,{},)))):(jsx(Fragment,{},jsx(RadixThemesBox,{},)))))
  )
}


function Fragment_c260c4514ce0680c45925e1f6238aa95 () {
  const reflex___state____state__app___state___page_state____page_state = useContext(StateContexts.reflex___state____state__app___state___page_state____page_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___page_state____page_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["width"] : "100%", ["height"] : "100%", ["padding"] : "2rem" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"column",gap:"2"},jsx(Text_9d3a7751e97881a128bab8621a2a3c6a,{},),jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--gray-9)" }),size:"2"},"Please wait"))))):(jsx(Fragment_4ba673c223cfb89910a0b8d5258c1909,{},))))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack page",css:({ ["height"] : "100vh" }),direction:"row",gap:"0"},jsx(RadixThemesBox,{css:({ ["flex"] : "1", ["minWidth"] : "0", ["height"] : "100vh" })},jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%", ["height"] : "100vh" }),direction:"column",gap:"0"},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["background"] : "var(--nav-bg)" })},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",justify:"between",gap:"3"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"4"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/"},jsx("img",{css:({ ["width"] : "5em", ["height"] : "auto" }),src:"/images/logo.png"},))),jsx(RadixThemesFlex,{align:"center",gap:"5"},jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/news"},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--text)" }),size:"5"},"News")))),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/shed"},jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--text)" }),size:"5"},"Bike Shed")))))),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesDropdownMenu.Root,{},jsx(RadixThemesDropdownMenu.Trigger,{},jsx(RadixThemesIconButton,{css:({ ["padding"] : "6px", ["background"] : "var(--accent)" }),radius:"full",size:"2"},jsx(LucideUser,{size:24},))),jsx(RadixThemesDropdownMenu.Content,{},jsx(RadixThemesDropdownMenu.Item,{},"Settings"),jsx(RadixThemesDropdownMenu.Separator,{},),jsx(Dropdownmenu__item_2eb1bc7cebe117a4cfccf6cd9dd34d7d,{},))))),jsx(RadixThemesBox,{css:({ ["padding"] : ({ ["base"] : "1rem", ["md"] : "2rem" }), ["width"] : "100%", ["height"] : "100%", ["overflow"] : "auto" })},jsx(Fragment_c260c4514ce0680c45925e1f6238aa95,{},)))))),jsx("title",{},"Bike Analyser"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}