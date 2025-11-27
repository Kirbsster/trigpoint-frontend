import {Fragment,useCallback,useContext,useEffect} from "react"
import {EventLoopContext,StateContexts} from "$/utils/context"
import {ReflexEvent,getRefValue,getRefValues,isTrue} from "$/utils/state"
import {Box as RadixThemesBox,Button as RadixThemesButton,Flex as RadixThemesFlex,Heading as RadixThemesHeading,Link as RadixThemesLink,Text as RadixThemesText,TextField as RadixThemesTextField} from "@radix-ui/themes"
import {Root as RadixFormRoot} from "@radix-ui/react-form"
import {Lock as LucideLock,User as LucideUser} from "lucide-react"
import {Link as ReactRouterLink} from "react-router"
import {jsx} from "@emotion/react"




function Text_9d3a7751e97881a128bab8621a2a3c6a () {
  const reflex___state____state__app___state___page_state____page_state = useContext(StateContexts.reflex___state____state__app___state___page_state____page_state)



  return (
    jsx(RadixThemesText,{as:"p",size:"4",weight:"medium"},reflex___state____state__app___state___page_state____page_state.loading_message_rx_state_)
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


function Button_3d6f93a12f5b1c5806c9ce8f6b59ab84 () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(RadixThemesButton,{css:({ ["width"] : "100%" }),disabled:reflex___state____state__app___state___auth_state____auth_state.loading_rx_state_,size:"3",type:"submit"},"Sign in")
  )
}


function Root_6ee79f18f61ca52d7845adaaa5e7839b () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

    const handleSubmit_caeac2ea86a26e4a49d28484f3f7b6cb = useCallback((ev) => {
        const $form = ev.target
        ev.preventDefault()
        const form_data = {...Object.fromEntries(new FormData($form).entries()), ...({  })};

        (((...args) => (addEvents([(ReflexEvent("reflex___state____state.app___state___auth_state____auth_state.login", ({  }), ({  })))], args, ({  }))))(ev));

        if (false) {
            $form.reset()
        }
    })
    


  return (
    jsx(RadixFormRoot,{className:"Root ",css:({ ["width"] : "100%", ["maxWidth"] : "28em", ["size"] : "4" }),onSubmit:handleSubmit_caeac2ea86a26e4a49d28484f3f7b6cb},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"6"},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["width"] : "100%" }),direction:"column",gap:"5"},jsx(RadixThemesHeading,{as:"h2",css:({ ["textAlign"] : "center", ["width"] : "100%" }),size:"6"},"Sign in")),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"2"},jsx(RadixThemesText,{as:"p",css:({ ["textAlign"] : "left", ["width"] : "100%" }),size:"3",weight:"medium"},"Email address"),jsx(Textfield__root_4cded061d5903ffd2731f61134b763eb,{},)),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"2"},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",justify:"between",gap:"3"},jsx(RadixThemesText,{as:"p",size:"3",weight:"medium"},"Password"),jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) }),size:"3"},jsx(ReactRouterLink,{to:"/forgot"},"Forgot password?"))),jsx(Textfield__root_adc9da47d5a228ad91fe409df77ce787,{},)),jsx(Fragment_011b71c2c26d199d3184d44097684145,{},),jsx(Button_3d6f93a12f5b1c5806c9ce8f6b59ab84,{},),jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["opacity"] : "0.8", ["width"] : "100%" }),direction:"row",gap:"2"},jsx(RadixThemesText,{as:"p",size:"3"},"New here?"),jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) }),size:"3"},jsx(ReactRouterLink,{to:"/register"},"Sign up")))))
  )
}


function Fragment_febe8d11adcd1995b10511e1a8bcfdcf () {
  const reflex___state____state__app___state___page_state____page_state = useContext(StateContexts.reflex___state____state__app___state___page_state____page_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___page_state____page_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["width"] : "100%", ["height"] : "100%", ["padding"] : "2rem" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"column",gap:"2"},jsx(Text_9d3a7751e97881a128bab8621a2a3c6a,{},),jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--gray-9)" }),size:"2"},"Please wait"))))):(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"column",gap:"3"},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["minHeight"] : "100vh" })},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["minH"] : "100vh", ["padding"] : "6" })},jsx(RadixThemesFlex,{align:"stretch",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"4"},jsx(RadixThemesHeading,{size:"5"},""),jsx(Root_6ee79f18f61ca52d7845adaaa5e7839b,{},),jsx(RadixThemesBox,{},)))))))))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(Fragment_febe8d11adcd1995b10511e1a8bcfdcf,{},),jsx("title",{},"Login"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}