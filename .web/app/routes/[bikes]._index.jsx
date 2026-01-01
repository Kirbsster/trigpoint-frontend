import {Fragment,useCallback,useContext,useEffect,useRef} from "react"
import {Box as RadixThemesBox,Button as RadixThemesButton,Card as RadixThemesCard,Dialog as RadixThemesDialog,DropdownMenu as RadixThemesDropdownMenu,Flex as RadixThemesFlex,Heading as RadixThemesHeading,IconButton as RadixThemesIconButton,Link as RadixThemesLink,Text as RadixThemesText,TextField as RadixThemesTextField} from "@radix-ui/themes"
import {Link as ReactRouterLink} from "react-router"
import {EventLoopContext,StateContexts,UploadFilesContext} from "$/utils/context"
import {ReflexEvent,isNotNullOrUndefined,isTrue,refs} from "$/utils/state"
import {Image as LucideImage,Trash2 as LucideTrash2,User as LucideUser,X as LucideX} from "lucide-react"
import DebounceInput from "react-debounce-input"
import {} from "react-dropzone"
import {useDropzone} from "react-dropzone"
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


function Dialog__trigger_919e57369c29cd92b0a4adbc65df2e84 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx(RadixThemesDialog.Trigger,{},jsx(RadixThemesFlex,{},jsx(RadixThemesButton,{onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.reset_new_bike_form", ({  }), ({  }))), (ReflexEvent("_call_function", ({ ["function"] : (() => (refs["__clear_selected_files"]("bike-hero-upload-modal"))), ["callback"] : null }), ({  })))], [_e], ({  }))))},"+ Add bike")))
  )
}


function Debounceinput_77abbc50795c52b3f9a09a5f823c500b () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_5ee33e437501c1a1c38bcb72624d71ca = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.set_name", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{css:({ ["width"] : "100%" }),debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_5ee33e437501c1a1c38bcb72624d71ca,placeholder:"e.g. Whyte T-130",value:(isNotNullOrUndefined(reflex___state____state__app___state___bike_state____bike_state.name_rx_state_) ? reflex___state____state__app___state___bike_state____bike_state.name_rx_state_ : "")},)
  )
}


function Debounceinput_74c9942055f09019d27dee7c04fc377e () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_0b5b0aaf155d194e564e479d1ee0beab = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.set_brand", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{css:({ ["width"] : "100%" }),debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_0b5b0aaf155d194e564e479d1ee0beab,placeholder:"e.g. Whyte",value:(isNotNullOrUndefined(reflex___state____state__app___state___bike_state____bike_state.brand_rx_state_) ? reflex___state____state__app___state___bike_state____bike_state.brand_rx_state_ : "")},)
  )
}


function Debounceinput_9e50b45ecbaec90a1e46b4fa528c749b () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_change_99ded5b35c7025185ea44c3f611e0f07 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.set_model_year", ({ ["value"] : _e?.["target"]?.["value"] }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(DebounceInput,{css:({ ["width"] : "100%" }),debounceTimeout:300,element:RadixThemesTextField.Root,onChange:on_change_99ded5b35c7025185ea44c3f611e0f07,placeholder:"e.g. 2019",value:(isNotNullOrUndefined(reflex___state____state__app___state___bike_state____bike_state.model_year_rx_state_) ? reflex___state____state__app___state___bike_state____bike_state.model_year_rx_state_ : "")},)
  )
}


function Img_432ae8b87f0cd67571ee2d88d32d3685 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx("img",{css:({ ["width"] : "100%", ["height"] : "250px", ["objectFit"] : "cover", ["objectPosition"] : "center" }),src:reflex___state____state__app___state___bike_state____bike_state.hero_preview_src_rx_state_},)
  )
}


function Iconbutton_5acbcaede499624c10b917dda15c434b () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_06adfe843c4659ab222358d484b625e7 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.clear_hero_preview", ({  }), ({  }))), (ReflexEvent("_call_function", ({ ["function"] : (() => (refs["__clear_selected_files"]("bike-hero-upload-modal"))), ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesIconButton,{"aria-label":"Clear image",css:({ ["padding"] : "6px", ["position"] : "absolute", ["top"] : "10px", ["right"] : "10px", ["background"] : "rgba(0,0,0,0.55)", ["color"] : "white", ["boxShadow"] : "0 6px 18px rgba(0,0,0,0.35)", ["&:hover"] : ({ ["background"] : "rgba(0,0,0,0.75)" }), ["&:active"] : ({ ["transform"] : "scale(0.96)" }) }),onClick:on_click_06adfe843c4659ab222358d484b625e7,radius:"full",size:"2",variant:"solid"},jsx(LucideX,{size:24},))
  )
}


function Comp_2b5e26d3ab00e73a3266f2e5f0d00f14 () {
  const ref_bike_hero_upload_modal = useRef(null); refs["ref_bike_hero_upload_modal"] = ref_bike_hero_upload_modal;
const [addEvents, connectErrors] = useContext(EventLoopContext);
const on_drop_56f8eaedb71ecaad0650bc86a4e89c34 = useCallback(((_ev_0) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.set_hero_preview", ({ ["files"] : _ev_0, ["upload_id"] : "bike-hero-upload-modal", ["extra_headers"] : ({  }) }), ({  }), "uploadFiles"))], [_ev_0], ({  })))), [addEvents, ReflexEvent])
const on_drop_rejected_2fcedbdc0771e7617b4270e2d1ac8cc9 = useCallback(((_ev_0) => (addEvents([(ReflexEvent("_call_function", ({ ["function"] : (() => (refs['__toast']?.["error"]("", ({ ["title"] : "Files not Accepted", ["description"] : _ev_0.map(((osizayzf) => (osizayzf?.["file"]?.["path"]+": "+osizayzf?.["errors"].map(((wnkiegyk) => wnkiegyk?.["message"])).join(", ")))).join("\n\n"), ["closeButton"] : true, ["style"] : ({ ["whiteSpace"] : "pre-line" }) })))), ["callback"] : null }), ({  })))], [_ev_0], ({  })))), [addEvents, ReflexEvent])
const { getRootProps: xdvxrcsn, getInputProps: udaxihhe, isDragActive: bacghqta} = useDropzone(({ ["maxFiles"] : 1, ["accept"] : ["image/*"], ["onDrop"] : on_drop_56f8eaedb71ecaad0650bc86a4e89c34, ["multiple"] : true, ["id"] : "bike-hero-upload-modal", ["onDropRejected"] : on_drop_rejected_2fcedbdc0771e7617b4270e2d1ac8cc9 }));



  return (
    jsx(Fragment,{},jsx(RadixThemesBox,{className:"rx-Upload",css:({ ["width"] : "100%", ["borderRadius"] : "0.75rem", ["border"] : "1px dashed var(--accent-12)", ["padding"] : "5em", ["textAlign"] : "center" }),id:"bike-hero-upload-modal",ref:ref_bike_hero_upload_modal,...xdvxrcsn()},jsx("input",{type:"file",...udaxihhe()},),jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["padding"] : "1rem", ["textAlign"] : "center", ["borderRadius"] : "0.75rem", ["border"] : "2px solid rgba(0,0,0,0.35)", ["boxShadow"] : "0 10px 28px rgba(0,0,0,0.35)", ["background"] : "rgba(255,255,255,0.03)", ["&:hover"] : ({ ["border"] : "2px solid rgba(0,0,0,0.35)", ["background"] : "rgba(0,0,0,0.1)", ["boxShadow"] : "0 10px 28px rgba(0,0,0,0.35)", ["cursor"] : "pointer" }), ["&:active"] : ({ ["transform"] : "translateY(1px) scale(0.98)" }) })},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"1"},jsx(LucideImage,{css:({ ["opacity"] : "0.9" }),size:26},),jsx(RadixThemesText,{as:"p",size:"3",weight:"medium"},"Add a hero image"),jsx(RadixThemesText,{as:"p",css:({ ["opacity"] : "0.7" }),size:"2"},"Click to browse or drag & drop")))))
  )
}


function Fragment_c78c8b2f131506e38bebfbd93cc9dc6d () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___bike_state____bike_state.hero_preview_src_rx_state_?.valueOf?.() === ""?.valueOf?.()))?(jsx(Fragment,{},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["position"] : "relative", ["borderRadius"] : "0.75rem", ["overflow"] : "hidden", ["border"] : "1px solid rgba(255,255,255,0.12)", ["boxShadow"] : "0 12px 36px rgba(0,0,0,0.35)" })},jsx(Img_432ae8b87f0cd67571ee2d88d32d3685,{},),jsx(Iconbutton_5acbcaede499624c10b917dda15c434b,{},)))):(jsx(Fragment,{},jsx(Comp_2b5e26d3ab00e73a3266f2e5f0d00f14,{},)))))
  )
}


function Text_285b5f47b9f8469db1851a8200726ba0 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(RadixThemesText,{as:"p",css:({ ["color"] : "orange" }),size:"2"},reflex___state____state__app___state___bike_state____bike_state.hero_preview_error_rx_state_)
  )
}


function Fragment_ec1070bcbba2fe45066d21cb439d75dc () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___bike_state____bike_state.hero_preview_error_rx_state_?.valueOf?.() === ""?.valueOf?.()))?(jsx(Fragment,{},jsx(Text_285b5f47b9f8469db1851a8200726ba0,{},))):(jsx(Fragment,{},jsx(RadixThemesBox,{},)))))
  )
}


function Text_66c079d8c1159a72b02b2961f378b420 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(RadixThemesText,{as:"p",css:({ ["color"] : "red" })},reflex___state____state__app___state___bike_state____bike_state.message_rx_state_)
  )
}


function Fragment_208259d694ed16354c35fb396c64d63d () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___bike_state____bike_state.message_rx_state_?.valueOf?.() === ""?.valueOf?.()))?(jsx(Fragment,{},jsx(Text_66c079d8c1159a72b02b2961f378b420,{},))):(jsx(Fragment,{},jsx(RadixThemesBox,{},)))))
  )
}


function Button_8626242a7b4564f5a955129564865456 () {
  const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_18c093e4ac808214881da1b15b6f2416 = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.reset_new_bike_form", ({  }), ({  }))), (ReflexEvent("_call_function", ({ ["function"] : (() => (refs["__clear_selected_files"]("bike-hero-upload-modal"))), ["callback"] : null }), ({  })))], [_e], ({  })))), [addEvents, ReflexEvent])

  return (
    jsx(RadixThemesButton,{onClick:on_click_18c093e4ac808214881da1b15b6f2416,variant:"soft"},"Cancel")
  )
}


function Button_d85594528602db3e799d9e896c2f75d1 () {
  const [filesById, setFilesById] = useContext(UploadFilesContext);
const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);

const on_click_63d15a7442e986b297fc84568820369f = useCallback(((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.save_bike", ({ ["files"] : filesById?.["bike-hero-upload-modal"], ["upload_id"] : "bike-hero-upload-modal", ["extra_headers"] : ({  }) }), ({  }), "uploadFiles"))], [_e], ({  })))), [addEvents, ReflexEvent, filesById, setFilesById])

  return (
    jsx(RadixThemesButton,{loading:reflex___state____state__app___state___bike_state____bike_state.loading_rx_state_,onClick:on_click_63d15a7442e986b297fc84568820369f},"Save bike")
  )
}


function Flex_6d66a6a1ed0476409ba5b2dbdf9b3975 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)
const [addEvents, connectErrors] = useContext(EventLoopContext);



  return (
    jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"3"},Array.prototype.map.call(reflex___state____state__app___state___bike_state____bike_state.bikes_rx_state_ ?? [],((bike_rx_state_,index_69d6a5bb4ee80e3609ec8b657d475488)=>(jsx(RadixThemesCard,{css:({ ["width"] : "100%" }),key:index_69d6a5bb4ee80e3609ec8b657d475488},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "start", ["width"] : "100%" }),direction:"row",gap:"2"},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["cursor"] : "pointer" }),onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.goto_bike", ({ ["bike_id"] : bike_rx_state_?.["id"] }), ({  })))], [_e], ({  }))))},jsx(Fragment,{},(!(((isTrue(bike_rx_state_?.["hero_url"]) ? bike_rx_state_?.["hero_url"] : null)?.valueOf?.() === null?.valueOf?.()))?(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center", ["width"] : "100%" }),direction:"row",gap:"3"},jsx("img",{css:({ ["width"] : "140px", ["height"] : "140px", ["objectFit"] : "cover", ["borderRadius"] : "0.75rem" }),src:(isTrue(bike_rx_state_?.["hero_url"]) ? bike_rx_state_?.["hero_url"] : "")},),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "flex-start", ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesHeading,{size:"4"},(isTrue(bike_rx_state_?.["name"]) ? bike_rx_state_?.["name"] : "Untitled")),jsx(RadixThemesText,{as:"p",size:"3"},(isTrue(bike_rx_state_?.["brand"]) ? bike_rx_state_?.["brand"] : "")),jsx(RadixThemesText,{as:"p",size:"2"},("Model year: "+(isTrue(bike_rx_state_?.["model_year"]) ? bike_rx_state_?.["model_year"] : null))))))):(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "flex-start", ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesHeading,{size:"4"},(isTrue(bike_rx_state_?.["name"]) ? bike_rx_state_?.["name"] : "Untitled")),jsx(RadixThemesText,{as:"p",size:"3"},(isTrue(bike_rx_state_?.["brand"]) ? bike_rx_state_?.["brand"] : "")),jsx(RadixThemesText,{as:"p",size:"2"},("Model year: "+(isTrue(bike_rx_state_?.["model_year"]) ? bike_rx_state_?.["model_year"] : null))))))))),jsx(RadixThemesIconButton,{css:({ ["padding"] : "6px" }),onClick:((_e) => (addEvents([(ReflexEvent("reflex___state____state.app___state___bike_state____bike_state.delete_bike", ({ ["bike_id"] : bike_rx_state_?.["id"] }), ({  })))], [_e], ({  })))),variant:"ghost"},jsx(LucideTrash2,{},))))))))
  )
}


function Fragment_b214116c3a27a5e73bc3d4a8d61ba453 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___bike_state____bike_state.has_bikes_rx_state_?(jsx(Fragment,{},jsx(Flex_6d66a6a1ed0476409ba5b2dbdf9b3975,{},))):(jsx(Fragment,{},jsx(RadixThemesText,{as:"p",size:"3"},"You have no bikes yet. Add one!")))))
  )
}


function Fragment_f3efc56ce1bfcb8e70de33be805cc6a1 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___bike_state____bike_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesText,{as:"p"},"Loading bikes..."))):(jsx(Fragment_b214116c3a27a5e73bc3d4a8d61ba453,{},))))
  )
}


function Fragment_3079a1292be83b46f5493f26a73f08e2 () {
  const reflex___state____state__app___state___bike_state____bike_state = useContext(StateContexts.reflex___state____state__app___state___bike_state____bike_state)



  return (
    jsx(Fragment,{},(!((reflex___state____state__app___state___bike_state____bike_state.message_rx_state_?.valueOf?.() === ""?.valueOf?.()))?(jsx(Fragment,{},jsx(Text_66c079d8c1159a72b02b2961f378b420,{},))):(jsx(Fragment,{},))))
  )
}


function Fragment_88bb2bcb90c1708286a16e65842ac083 () {
  const reflex___state____state__app___state___auth_state____auth_state = useContext(StateContexts.reflex___state____state__app___state___auth_state____auth_state)



  return (
    jsx(Fragment,{},(isTrue(reflex___state____state__app___state___auth_state____auth_state.access_token_rx_state_)?(jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"4"},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center", ["width"] : "100%" }),direction:"row",gap:"3"},jsx(RadixThemesHeading,{size:"6"},"My bikes"),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesDialog.Root,{},jsx(Dialog__trigger_919e57369c29cd92b0a4adbc65df2e84,{},),jsx(RadixThemesDialog.Content,{css:({ ["maxWidth"] : "520px", ["width"] : "95vw" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"4"},jsx(RadixThemesHeading,{size:"6"},"Add a bike"),jsx(RadixThemesText,{as:"p",css:({ ["opacity"] : "0.8" }),size:"3"},"Enter basic details for this bike."),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesText,{as:"p",size:"3"},"Name"),jsx(Debounceinput_77abbc50795c52b3f9a09a5f823c500b,{},)),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesText,{as:"p",size:"3"},"Brand"),jsx(Debounceinput_74c9942055f09019d27dee7c04fc377e,{},)),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"1"},jsx(RadixThemesText,{as:"p",size:"3"},"Model year"),jsx(Debounceinput_9e50b45ecbaec90a1e46b4fa528c749b,{},)),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"column",gap:"2"},jsx(RadixThemesText,{as:"p",size:"3"},"Hero image (optional)"),jsx(Fragment_c78c8b2f131506e38bebfbd93cc9dc6d,{},),jsx(Fragment_ec1070bcbba2fe45066d21cb439d75dc,{},)),jsx(Fragment_208259d694ed16354c35fb396c64d63d,{},),jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",gap:"3"},jsx(RadixThemesDialog.Close,{},jsx(RadixThemesFlex,{},jsx(Button_8626242a7b4564f5a955129564865456,{},))),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(Button_d85594528602db3e799d9e896c2f75d1,{},)))))),jsx(Fragment_f3efc56ce1bfcb8e70de33be805cc6a1,{},),jsx(Fragment_3079a1292be83b46f5493f26a73f08e2,{},)))):(jsx(Fragment,{},jsx(RadixThemesBox,{},)))))
  )
}


function Fragment_41bb8c126dd7a3e8911bc822d1e7b2da () {
  const reflex___state____state__app___state___page_state____page_state = useContext(StateContexts.reflex___state____state__app___state___page_state____page_state)



  return (
    jsx(Fragment,{},(reflex___state____state__app___state___page_state____page_state.loading_rx_state_?(jsx(Fragment,{},jsx(RadixThemesFlex,{css:({ ["display"] : "flex", ["alignItems"] : "center", ["justifyContent"] : "center", ["width"] : "100%", ["height"] : "100%", ["padding"] : "2rem" })},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["alignItems"] : "center" }),direction:"column",gap:"2"},jsx(Text_9d3a7751e97881a128bab8621a2a3c6a,{},),jsx(RadixThemesText,{as:"p",css:({ ["color"] : "var(--gray-9)" }),size:"2"},"Please wait"))))):(jsx(Fragment_88bb2bcb90c1708286a16e65842ac083,{},))))
  )
}


export default function Component() {





  return (
    jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack page",css:({ ["height"] : "100vh" }),direction:"row",gap:"0"},jsx(RadixThemesBox,{css:({ ["flex"] : "1", ["minWidth"] : "0", ["height"] : "100vh" })},jsx(Fragment,{},jsx(RadixThemesFlex,{align:"start",className:"rx-Stack",css:({ ["width"] : "100%", ["height"] : "100vh" }),direction:"column",gap:"0"},jsx(RadixThemesBox,{css:({ ["width"] : "100%", ["background"] : "var(--nav-bg)" })},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",css:({ ["width"] : "100%" }),direction:"row",justify:"between",gap:"3"},jsx(RadixThemesFlex,{align:"center",className:"rx-Stack",direction:"row",gap:"4"},jsx(RadixThemesLink,{asChild:true,css:({ ["&:hover"] : ({ ["color"] : "var(--accent-8)" }) })},jsx(ReactRouterLink,{to:"/"},jsx("img",{css:({ ["width"] : "5em", ["height"] : "auto" }),src:"/images/logo.png"},))),jsx(RadixThemesFlex,{align:"center",gap:"5"},jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_7791ce1263bb1fc828d028f3bd7798d7,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_7e2142eaacfc4e664d63fc92b0517ac8,{},)),jsx(RadixThemesCard,{asChild:true,variant:"ghost"},jsx(Link_bb99783a5bec6e6089350098953110d9,{},)))),jsx(RadixThemesFlex,{css:({ ["flex"] : 1, ["justifySelf"] : "stretch", ["alignSelf"] : "stretch" })},),jsx(RadixThemesBox,{css:({ ["paddingRight"] : "0.5rem" })},jsx(RadixThemesDropdownMenu.Root,{},jsx(RadixThemesDropdownMenu.Trigger,{},jsx(RadixThemesIconButton,{css:({ ["padding"] : "6px", ["color"] : "var(--text-dark)", ["background"] : "var(--bg)", ["&:active"] : ({ ["boxShadow"] : "none" }), ["&:focus"] : ({ ["boxShadow"] : "none", ["outline"] : "none" }) }),radius:"full",size:"3"},jsx(LucideUser,{size:36},))),jsx(RadixThemesDropdownMenu.Content,{},jsx(RadixThemesDropdownMenu.Item,{},"Settings"),jsx(RadixThemesDropdownMenu.Separator,{},),jsx(Dropdownmenu__item_2eb1bc7cebe117a4cfccf6cd9dd34d7d,{},)))))),jsx(RadixThemesBox,{css:({ ["padding"] : ({ ["base"] : "1rem", ["md"] : "2rem" }), ["width"] : "100%", ["height"] : "100%", ["overflow"] : "auto" })},jsx(Fragment_41bb8c126dd7a3e8911bc822d1e7b2da,{},)))))),jsx("title",{},"My bikes"),jsx("meta",{content:"favicon.ico",property:"og:image"},))
  )
}