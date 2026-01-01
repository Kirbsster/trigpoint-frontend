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


function Textfield__root_a5d1d78e033c35ef165cc8ca27eab0a1 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_f370d6355a7f3491f9109247e0629a13 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___auth_state____auth_state.set_new_password", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesTextField.Root,{css:({ ["width"] : "100%" }),onChange:on_change_f370d6355a7f3491f9109247e0629a13,placeholder:"password",required:true,size:"3",type:"password"},jsx(RadixThemesTextField.Slot,{},jsx(LucideLock,{},)))
  )
}


function Textfield__root_c561d8f11826618f2493eab1b819d3cc () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_3290b51a61f7f739d50af79247358a0e = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___auth_state____auth_state.set_new_password2", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesTextField.Root,{css:({ ["width"] : "100%" }),onChange:on_change_3290b51a61f7f739d50af79247358a0e,placeholder:"confirm password",required:true,size:"3",type:"password"},jsx(RadixThemesTextField.Slot,{},jsx(LucideLock,{},)))
  )
}


function Button_5e8bbf08399f397413c8b4e234d5c102 () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_0f398ec0fedc0168638cfa522ae89c25 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___auth_state____auth_state.reset_password", ({  }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{disabled:reflex___state____state__app___state___auth_state____auth_state.loading_rx_state_,onClick:on_click_0f398ec0fedc0168638cfa522ae89c25,size:"3"},"Reset password")
  )
}


function Text_216e88a1ff074fc08ad93c8423d2b0a1 () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(RadixThemesText,{as:"p"},reflex___state____state__app___state___auth_state____auth_state.message_rx_state_)
  )
}


function Fragment_74040bd04558be0fb8d6a732288fad7c () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___auth_state____auth_state.message_rx_state_?.valueOf?.() === ""?.valueOf?.()))?(jsx(Fragment,{},jsx(Text_216e88a1ff074fc08ad93c8423d2b0a1,{},))):(jsx(Fragment,{},))))
  )
}


function Root_bb0e7176a4aa5261934ece87250c5c2e () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

    const handleSubmit_a229ae2b65e6d412f4ed0ee248a7458d = useCallback((ev) => {
        const $form = ev.target
        ev.preventDefault()
        const form_data = {...Object.fromEntries(new FormData($form).entries()), ...({  })};

        (((...args) => (addEvents([(ReflexEvent("_call_function", ({ ["function"] : (() => null), ["callback"] : null }), ({ ["preventDefault"] : true })))], args, ({  }))))(ev));

        if (false) {
            $form.reset()
        }
    })
    


  return (
    jsx(RadixFormRoot,{className:"Root ",css:({ ["width"] : "100%" }),onSubmit:handleSubmit_a229ae2b65e6d412f4ed0ee248a7458d},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",direction:"column",gap:"3"},jsx(RadixThemesHeading,{size:"6"},"Reset your password"),jsx(RadixThemesText,{as:"p",css:({ ["textAlign"] : "left", ["width"] : "100%" }),size:"3",weight:"medium"},"New Password"),jsx(Textfield__root_a5d1d78e033c35ef165cc8ca27eab0a1,{},),jsx(Textfield__root_c561d8f11826618f2493eab1b819d3cc,{},),jsx(Button_5e8bbf08399f397413c8b4e234d5c102,{},),jsx(Fragment_74040bd04558be0fb8d6a732288fad7c,{},),jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["size"] : "3", ["width"] : "100%" }),gap:"4"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/login"},"Back to login"))))))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack page",css:({ ["height"] : "100vh" }),direction:"row",gap:"0"},jsx(RadixThemesBox,{css:({ ["flex"] : "1", ["minWidth"] : "0", ["height"] : "100vh" })},jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%", ["height"] : "100vh" }),direction:"column",gap:"0"},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["background"] : "var(--nav-bg)" })},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",justify:"between",gap:"3"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"4"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/"},jsx("img",{css:({ ["width"] : "5em", ["height"] : "auto" }),src:"/images/logo.png"},))),jsx(RadixThemesFlex,{align:"center",gap:"5"},jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_7791ce1263bb1fc828d028f3bd7798d7,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_7e2142eaacfc4e664d63fc92b0517ac8,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_bb99783a5bec6e6089350098953110d9,{},)))),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesBox,{css:({ ["paddingRight"] : "0.5rem" })},jsx(RadixThemesDropdownMenu.Root,{},jsx(RadixThemesDropdownMenu.Trigger,{},jsx(RadixThemesIconButton,{css:({ ["padding"] : "6px", ["color"] : "var(--text-dark)", ["background"] : "var(--bg)", ["&:active"] : ({ ["boxShadow"] : "none" }), ["&:focus"] : ({ ["boxShadow"] : "none", ["outline"] : "none" }) }),radius:"full",size:"3"},jsx(LucideUser,{size:36},))),jsx(RadixThemesDropdownMenu.Content,{},jsx(RadixThemesDropdownMenu.Item,{},"Settings"),jsx(RadixThemesDropdownMenu.Separator,{},),jsx(Dropdownmenu__item_2eb1bc7cebe117a4cfccf6cd9dd34d7d,{},)))))),jsx(RadixThemesBox,{css:({ ["padding"] : ({ ["base"] : "1rem", ["md"] : "2rem" }), ["width"] : "100%", ["height"] : "100%", ["overflow"] : "auto" })},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["minHeight"] : "100vh" })},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["minH"] : "100vh", ["padding"] : "6" })},jsx(RadixThemesFlex,{align:"stretch",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"4"},jsx(RadixThemesHeading,{size:"5"},""),jsx(Root_bb0e7176a4aa5261934ece87250c5c2e,{},),jsx(RadixThemesBox,{},))))))))),jsx("title",{},"Reset Password"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}