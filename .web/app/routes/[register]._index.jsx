import {Fragment,useCallback,useContext,useEffect} from "react"
import {Box as RadixThemesBox,Button as RadixThemesButton,Card as RadixThemesCard,DropdownMenu as RadixThemesDropdownMenu,Flex as RadixThemesFlex,Heading as RadixThemesHeading,IconButton as RadixThemesIconButton,Link as RadixThemesLink,Text as RadixThemesText,TextField as RadixThemesTextField} from "@radix-ui/themes"
import {Link as ReactRouterLink} from "react-router"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,getRefValue,getRefValues,isTrue} from "$/utils/state"
import {Lock as LucideLock,User as LucideUser} from "lucide-react"
import {Root as RadixFormRoot} from "@radix-ui/react-form"
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


function Textfield__root_4cded061d5903ffd2731f61134b763eb () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_8d7f6365c711a7565d85e2838ddad5bb = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___auth_state____auth_state.set_email", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesTextField.Root,{css:({ ["width"] : "100%" }),onChange:on_change_8d7f6365c711a7565d85e2838ddad5bb,placeholder:"email",required:true,size:"3",type:"email"},jsx(RadixThemesTextField.Slot,{},jsx(LucideUser,{},)))
  )
}


function Textfield__root_adc9da47d5a228ad91fe409df77ce787 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_eebbaba9c4f3487cff3e63181e6c7217 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___auth_state____auth_state.set_password", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesTextField.Root,{css:({ ["width"] : "100%" }),onChange:on_change_eebbaba9c4f3487cff3e63181e6c7217,placeholder:"password",required:true,size:"3",type:"password"},jsx(RadixThemesTextField.Slot,{},jsx(LucideLock,{},)))
  )
}


function Textfield__root_41ab339d1c7dc433c9cefff07d87b016 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_c1270145720ddec0695760ced70e96f1 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___auth_state____auth_state.set_password2", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesTextField.Root,{css:({ ["width"] : "100%" }),onChange:on_change_c1270145720ddec0695760ced70e96f1,placeholder:"confirm password",required:true,size:"3",type:"password"},jsx(RadixThemesTextField.Slot,{},jsx(LucideLock,{},)))
  )
}


function Button_f055a5350b85ea79e813163326d72bf1 () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(RadixThemesButton,{css:({ ["width"] : "100%", ["spacing"] : "3" }),disabled:reflex___state____state__app___state___auth_state____auth_state.loading_rx_state_,size:"3",type:"submit"},(reflex___state____state__app___state___auth_state____auth_state.loading_rx_state_ ? "Creating account..." : "Create account"))
  )
}


function Text_88c60002922e0e14d900e53ea91beb7f () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(RadixThemesText,{as:"p",css:({ ["color"] : "red" })},reflex___state____state__app___state___auth_state____auth_state.message_rx_state_)
  )
}


function Fragment_011b71c2c26d199d3184d44097684145 () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___auth_state____auth_state.message_rx_state_?.valueOf?.() === ""?.valueOf?.()))?(jsx(Fragment,{},jsx(Text_88c60002922e0e14d900e53ea91beb7f,{},))):(jsx(Fragment,{},))))
  )
}


function Root_a053d33ee287825faa41679039d2dd94 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

    const handleSubmit_ac5bf5b98d09b5d6d8b4de573d504260 = useCallback((ev) => {
        const $form = ev.target
        ev.preventDefault()
        const form_data = {...Object.fromEntries(new FormData($form).entries()), ...({  })};

        (((...args) => (addEvents([(ReflexEvent("reflex___state____state.app___state___auth_state____auth_state.register", ({  }), ({  })))], args, ({  }))))(ev));

        if (false) {
            $form.reset()
        }
    })
    


  return (
    jsx(RadixFormRoot,{className:"Root ",css:({ ["width"] : "100%" }),onSubmit:handleSubmit_ac5bf5b98d09b5d6d8b4de573d504260},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"6"},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["width"] : "100%" }),direction:"column",gap:"5"},jsx(RadixThemesHeading,{as:"h2",css:({ ["textAlign"] : "center", ["width"] : "100%" }),size:"6"},"Register")),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"2"},jsx(RadixThemesText,{as:"p",css:({ ["textAlign"] : "left", ["width"] : "100%" }),size:"3",weight:"medium"},"Email address"),jsx(Textfield__root_4cded061d5903ffd2731f61134b763eb,{},)),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"3"},jsx(RadixThemesText,{as:"p",css:({ ["textAlign"] : "left", ["width"] : "100%" }),size:"3",weight:"medium"},"New Password"),jsx(Textfield__root_adc9da47d5a228ad91fe409df77ce787,{},),jsx(Textfield__root_41ab339d1c7dc433c9cefff07d87b016,{},)),jsx(Button_f055a5350b85ea79e813163326d72bf1,{},),jsx(Fragment_011b71c2c26d199d3184d44097684145,{},)))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack page",css:({ ["height"] : "100vh" }),direction:"row",gap:"0"},jsx(RadixThemesBox,{css:({ ["flex"] : "1", ["minWidth"] : "0", ["height"] : "100vh" })},jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%", ["height"] : "100vh" }),direction:"column",gap:"0"},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["background"] : "var(--nav-bg)" })},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",justify:"between",gap:"3"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"4"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/"},jsx("img",{css:({ ["width"] : "5em", ["height"] : "auto" }),src:"/images/logo.png"},))),jsx(RadixThemesFlex,{align:"center",gap:"5"},jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_7791ce1263bb1fc828d028f3bd7798d7,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_7e2142eaacfc4e664d63fc92b0517ac8,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_bb99783a5bec6e6089350098953110d9,{},)))),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesBox,{css:({ ["paddingRight"] : "0.5rem" })},jsx(RadixThemesDropdownMenu.Root,{},jsx(RadixThemesDropdownMenu.Trigger,{},jsx(RadixThemesIconButton,{css:({ ["padding"] : "6px", ["color"] : "var(--text-dark)", ["background"] : "var(--bg)", ["&:active"] : ({ ["boxShadow"] : "none" }), ["&:focus"] : ({ ["boxShadow"] : "none", ["outline"] : "none" }) }),radius:"full",size:"3"},jsx(LucideUser,{size:36},))),jsx(RadixThemesDropdownMenu.Content,{},jsx(RadixThemesDropdownMenu.Item,{},"Settings"),jsx(RadixThemesDropdownMenu.Separator,{},),jsx(Dropdownmenu__item_2eb1bc7cebe117a4cfccf6cd9dd34d7d,{},)))))),jsx(RadixThemesBox,{css:({ ["padding"] : ({ ["base"] : "1rem", ["md"] : "2rem" }), ["width"] : "100%", ["height"] : "100%", ["overflow"] : "auto" })},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["minHeight"] : "100vh" })},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["minH"] : "100vh", ["padding"] : "6" })},jsx(RadixThemesFlex,{align:"stretch",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"4"},jsx(RadixThemesHeading,{size:"5"},""),jsx(Root_a053d33ee287825faa41679039d2dd94,{},),jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["size"] : "4", ["width"] : "100%" }),gap:"3"},jsx(RadixThemesText,{as:"p"},"Have an account?"),jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/login"},"Login"))))))))))),jsx("title",{},"Register"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}