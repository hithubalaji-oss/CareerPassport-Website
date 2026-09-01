/* @ds-bundle: {"format":4,"namespace":"CareerPassportDesignSystem_a8d325","components":[{"name":"CtaBand","sourcePath":"components/bands/CtaBand.jsx"},{"name":"Footer","sourcePath":"components/bands/Footer.jsx"},{"name":"HeroBand","sourcePath":"components/bands/HeroBand.jsx"},{"name":"LogoStrip","sourcePath":"components/bands/LogoStrip.jsx"},{"name":"Button","sourcePath":"components/buttons/Button.jsx"},{"name":"CategoryPill","sourcePath":"components/buttons/CategoryPill.jsx"},{"name":"IconButton","sourcePath":"components/buttons/IconButton.jsx"},{"name":"TextInput","sourcePath":"components/forms/TextInput.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"},{"name":"NavLink","sourcePath":"components/navigation/NavBar.jsx"},{"name":"Card","sourcePath":"components/surfaces/Card.jsx"},{"name":"CodeBlock","sourcePath":"components/surfaces/CodeBlock.jsx"},{"name":"PricingCard","sourcePath":"components/surfaces/PricingCard.jsx"},{"name":"Eyebrow","sourcePath":"components/typography/Eyebrow.jsx"}],"sourceHashes":{"components/bands/CtaBand.jsx":"da2ef81147c3","components/bands/Footer.jsx":"0c559d0cc86e","components/bands/HeroBand.jsx":"6f4162883562","components/bands/LogoStrip.jsx":"e2a147599234","components/buttons/Button.jsx":"5d1ad7bc504a","components/buttons/CategoryPill.jsx":"51cd14d09936","components/buttons/IconButton.jsx":"fb521edb5351","components/forms/TextInput.jsx":"c0af4d37e861","components/navigation/NavBar.jsx":"cc37704d6edd","components/surfaces/Card.jsx":"2947a29db9f8","components/surfaces/CodeBlock.jsx":"f26b8ceff48b","components/surfaces/PricingCard.jsx":"cf0fc79c71a0","components/typography/Eyebrow.jsx":"c41fc90064a6","ui_kits/app/AppShell.jsx":"30f7d489bbee","ui_kits/app/LoginScreen.jsx":"e0c7e47b14da","ui_kits/app/PassportScreen.jsx":"02a121991ebb","ui_kits/app/RequestsScreen.jsx":"548184524e78","ui_kits/app/SharingScreen.jsx":"57b0f331bcae","ui_kits/website/EmployersScreen.jsx":"1855fdee4171","ui_kits/website/HomeScreen.jsx":"a7447781a3b0","ui_kits/website/PricingScreen.jsx":"7641ddc6e489"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.CareerPassportDesignSystem_a8d325 = window.CareerPassportDesignSystem_a8d325 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/bands/CtaBand.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CtaBand({
  headline,
  sub,
  actions,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      background: "var(--surface-page)",
      borderTop: "1px solid var(--border-hairline)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-4xl) var(--space-lg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "var(--space-lg)"
    }
  }, /*#__PURE__*/React.createElement("h2", {
    style: {
      fontSize: "var(--display-xl-size)",
      lineHeight: "var(--display-xl-line)",
      letterSpacing: "var(--display-xl-track)",
      fontWeight: "var(--display-xl-weight)",
      maxWidth: 700
    }
  }, headline), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-body)",
      fontSize: "var(--body-lg-size)",
      lineHeight: "var(--body-lg-line)",
      maxWidth: 520
    }
  }, sub), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-sm)",
      flexWrap: "wrap",
      justifyContent: "center"
    }
  }, actions)));
}
Object.assign(__ds_scope, { CtaBand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/bands/CtaBand.jsx", error: String((e && e.message) || e) }); }

// components/bands/Footer.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Footer({
  brand = "CareerPassport",
  groups = [],
  note,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("footer", _extends({
    style: {
      background: "var(--surface-page)",
      borderTop: "1px solid var(--border-hairline)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-3xl) var(--space-lg)",
      display: "flex",
      gap: "var(--space-3xl)",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      minWidth: 200,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xs)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--weight-semibold)",
      fontSize: 17,
      letterSpacing: "-0.6px",
      color: "var(--text-heading)"
    }
  }, brand), note && /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-mute)",
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)"
    }
  }, note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3xl)",
      flexWrap: "wrap",
      flex: 1
    }
  }, groups.map((g, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-sm)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--mono-eyebrow-size)",
      lineHeight: "var(--mono-eyebrow-line)",
      textTransform: "uppercase",
      color: "var(--text-mute)"
    }
  }, g.title), g.links.map((l, j) => /*#__PURE__*/React.createElement("a", {
    key: j,
    href: "#",
    style: {
      color: "var(--text-body)",
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      textDecoration: "none"
    }
  }, l)))))));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/bands/Footer.jsx", error: String((e && e.message) || e) }); }

// components/bands/HeroBand.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function HeroBand({
  eyebrow,
  headline,
  sub,
  actions,
  mesh = true,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      position: "relative",
      background: "var(--surface-page)",
      overflow: "hidden",
      ...style
    }
  }, rest), mesh && /*#__PURE__*/React.createElement("div", {
    "aria-hidden": "true",
    style: {
      position: "absolute",
      inset: "-45% -6% auto -6%",
      height: "135%",
      background: "var(--gradient-mesh)",
      filter: "blur(40px)",
      opacity: 0.85,
      pointerEvents: "none"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-section) var(--space-lg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      textAlign: "center",
      gap: "var(--space-lg)"
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--mono-eyebrow-size)",
      lineHeight: "var(--mono-eyebrow-line)",
      fontWeight: "var(--mono-eyebrow-weight)",
      textTransform: "uppercase",
      color: "var(--text-mute)"
    }
  }, eyebrow), /*#__PURE__*/React.createElement("h1", {
    style: {
      fontSize: "var(--display-xl-size)",
      lineHeight: "var(--display-xl-line)",
      letterSpacing: "var(--display-xl-track)",
      fontWeight: "var(--display-xl-weight)",
      maxWidth: 780
    }
  }, headline), sub && /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-body)",
      fontSize: "var(--body-lg-size)",
      lineHeight: "var(--body-lg-line)",
      maxWidth: 560
    }
  }, sub), actions && /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-sm)",
      flexWrap: "wrap",
      justifyContent: "center"
    }
  }, actions), children));
}
Object.assign(__ds_scope, { HeroBand });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/bands/HeroBand.jsx", error: String((e && e.message) || e) }); }

// components/bands/LogoStrip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function LogoStrip({
  label,
  names = [],
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("section", _extends({
    style: {
      background: "var(--surface-page)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-xl) var(--space-lg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-lg)"
    }
  }, label && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-mute)",
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)"
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "var(--space-2xl)",
      alignItems: "center"
    }
  }, names.map((n, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--weight-semibold)",
      fontSize: 18,
      letterSpacing: "-0.5px",
      color: "var(--text-mute)"
    }
  }, n)))));
}
Object.assign(__ds_scope, { LogoStrip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/bands/LogoStrip.jsx", error: String((e && e.message) || e) }); }

// components/buttons/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const shared = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "var(--space-xs)",
  fontFamily: "var(--font-sans)",
  border: "1px solid transparent",
  cursor: "pointer",
  whiteSpace: "nowrap",
  textDecoration: "none",
  transition: "background var(--duration-fast) var(--ease-standard), color var(--duration-fast) var(--ease-standard)"
};
const variants = {
  primary: {
    background: "var(--primary)",
    color: "var(--on-primary)",
    borderRadius: "var(--radius-pill)",
    padding: "0 14px",
    height: 48,
    fontSize: "var(--button-lg-size)",
    lineHeight: "var(--button-lg-line)",
    fontWeight: "var(--button-lg-weight)"
  },
  secondary: {
    background: "var(--surface-card)",
    color: "var(--text-heading)",
    borderColor: "var(--border-hairline)",
    borderRadius: "var(--radius-pill)",
    padding: "0 14px",
    height: 48,
    fontSize: "var(--button-lg-size)",
    lineHeight: "var(--button-lg-line)",
    fontWeight: "var(--button-lg-weight)"
  },
  "primary-sm": {
    background: "var(--primary)",
    color: "var(--on-primary)",
    borderRadius: "var(--radius-sm)",
    padding: "0 10px",
    height: 32,
    fontSize: "var(--button-md-size)",
    lineHeight: "var(--button-md-line)",
    fontWeight: "var(--button-md-weight)"
  },
  "ghost-sm": {
    background: "var(--surface-card)",
    color: "var(--text-heading)",
    borderColor: "var(--border-hairline)",
    borderRadius: "var(--radius-sm)",
    padding: "0 10px",
    height: 32,
    fontSize: "var(--button-md-size)",
    lineHeight: "var(--button-md-line)",
    fontWeight: "var(--button-md-weight)"
  }
};
const hovers = {
  primary: {
    background: "var(--hover-ink)"
  },
  secondary: {
    background: "var(--hover-surface)"
  },
  "primary-sm": {
    background: "var(--hover-ink)"
  },
  "ghost-sm": {
    background: "var(--hover-surface)"
  }
};
function Button({
  variant = "primary",
  href,
  disabled,
  block,
  iconRight,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = href ? "a" : "button";
  const css = {
    ...shared,
    ...(variants[variant] || variants.primary),
    ...(hover && !disabled ? hovers[variant] : null),
    ...(block ? {
      display: "flex",
      width: "100%"
    } : null),
    ...(disabled ? {
      opacity: 0.4,
      pointerEvents: "none"
    } : null),
    ...style
  };
  return /*#__PURE__*/React.createElement(Tag, _extends({
    href: href,
    style: css,
    disabled: !href ? disabled : undefined,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false)
  }, rest), children, iconRight);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/Button.jsx", error: String((e && e.message) || e) }); }

// components/buttons/CategoryPill.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CategoryPill({
  active,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      height: 36,
      padding: "0 16px",
      borderRadius: "var(--radius-pill-category)",
      background: active ? "var(--primary)" : hover ? "var(--hover-surface)" : "var(--surface-card)",
      color: active ? "var(--on-primary)" : "var(--text-heading)",
      border: active ? "1px solid var(--primary)" : "1px solid var(--border-hairline)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--button-md-size)",
      lineHeight: "var(--button-md-line)",
      fontWeight: "var(--button-md-weight)",
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "background var(--duration-fast) var(--ease-standard)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { CategoryPill });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/CategoryPill.jsx", error: String((e && e.message) || e) }); }

// components/buttons/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function IconButton({
  size = 32,
  label,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("button", _extends({
    "aria-label": label,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      width: size,
      height: size,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-full)",
      background: hover ? "var(--hover-surface)" : "var(--surface-card)",
      border: "1px solid var(--border-hairline)",
      color: "var(--text-heading)",
      padding: 0,
      cursor: "pointer",
      transition: "background var(--duration-fast) var(--ease-standard)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/buttons/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/forms/TextInput.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function TextInput({
  label,
  hint,
  error,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const uid = id || React.useId();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xxs)"
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: uid,
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--label-sm-size)",
      lineHeight: "var(--label-sm-line)",
      letterSpacing: "var(--label-sm-track)",
      fontWeight: "var(--label-sm-weight)",
      color: "var(--text-heading)"
    }
  }, label), /*#__PURE__*/React.createElement("input", _extends({
    id: uid,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      background: "var(--surface-input)",
      color: "var(--text-heading)",
      border: "1px solid " + (error ? "var(--error)" : focus ? "var(--focus-ring)" : "var(--border-hairline)"),
      borderRadius: "var(--radius-sm)",
      padding: "var(--space-xs) var(--space-sm)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      outline: "none",
      width: "100%",
      transition: "border-color var(--duration-fast) var(--ease-standard)",
      ...style
    }
  }, rest)), (error || hint) && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-sans)",
      fontSize: "var(--body-sm-size)",
      lineHeight: "var(--body-sm-line)",
      color: error ? "var(--error)" : "var(--text-mute)"
    }
  }, error || hint));
}
Object.assign(__ds_scope, { TextInput });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/TextInput.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function NavBar({
  brand = "CareerPassport",
  links = [],
  right,
  sticky,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("header", _extends({
    style: {
      position: sticky ? "sticky" : "static",
      top: 0,
      zIndex: 20,
      background: "var(--surface-page)",
      borderBottom: "1px solid var(--border-hairline)",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-sm) var(--space-lg)",
      display: "flex",
      alignItems: "center",
      gap: "var(--space-lg)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "#",
    style: {
      fontFamily: "var(--font-sans)",
      fontWeight: "var(--weight-semibold)",
      fontSize: 17,
      letterSpacing: "-0.6px",
      color: "var(--text-heading)",
      textDecoration: "none",
      flex: "none"
    }
  }, brand), /*#__PURE__*/React.createElement("nav", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-xxs)",
      flex: 1
    }
  }, links.map((l, i) => {
    const {
      label,
      ...rest
    } = l;
    return /*#__PURE__*/React.createElement(NavLink, _extends({
      key: i
    }, rest), label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-xs)",
      flex: "none"
    }
  }, right)));
}
function NavLink({
  href = "#",
  active,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("a", _extends({
    href: href,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "inline-flex",
      alignItems: "center",
      height: 32,
      padding: "0 var(--space-sm)",
      borderRadius: "var(--radius-full)",
      background: hover ? "var(--hover-surface)" : "transparent",
      color: active ? "var(--text-heading)" : "var(--text-body)",
      fontFamily: "var(--font-sans)",
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      textDecoration: "none",
      transition: "background var(--duration-fast) var(--ease-standard)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { NavBar, NavLink });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Card({
  elevated,
  eyebrow,
  title,
  children,
  padding,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--surface-card)",
      border: "1px solid var(--border-hairline)",
      borderRadius: "var(--radius-md)",
      padding: padding || "var(--card-pad)",
      boxShadow: elevated ? "var(--elevation-2)" : "var(--elevation-1)",
      ...style
    }
  }, rest), eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--mono-eyebrow-size)",
      lineHeight: "var(--mono-eyebrow-line)",
      fontWeight: "var(--mono-eyebrow-weight)",
      textTransform: "uppercase",
      color: "var(--text-mute)",
      marginBottom: "var(--space-sm)"
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("h3", {
    style: {
      fontSize: "var(--heading-md-size)",
      lineHeight: "var(--heading-md-line)",
      letterSpacing: "var(--heading-md-track)",
      marginBottom: "var(--space-xs)"
    }
  }, title), children && /*#__PURE__*/React.createElement("div", {
    style: {
      color: "var(--text-body)",
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)"
    }
  }, children));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/Card.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/CodeBlock.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function CodeBlock({
  filename,
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--surface-code)",
      border: "1px solid var(--border-hairline)",
      borderRadius: "var(--radius-md)",
      overflow: "hidden",
      ...style
    }
  }, rest), filename && /*#__PURE__*/React.createElement("div", {
    style: {
      borderBottom: "1px solid var(--border-hairline)",
      padding: "var(--space-xs) var(--space-md)",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--body-sm-size)",
      color: "var(--text-mute)"
    }
  }, filename), /*#__PURE__*/React.createElement("pre", {
    style: {
      margin: 0,
      padding: "var(--space-md)",
      color: "var(--text-heading)",
      fontFamily: "var(--font-mono)",
      fontSize: "var(--code-size)",
      lineHeight: "var(--code-line)",
      overflowX: "auto"
    }
  }, children));
}
Object.assign(__ds_scope, { CodeBlock });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/CodeBlock.jsx", error: String((e && e.message) || e) }); }

// components/surfaces/PricingCard.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function PricingCard({
  name,
  price,
  cadence = "/mo",
  blurb,
  features = [],
  cta,
  featured,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      background: "var(--surface-card)",
      border: "1px solid " + (featured ? "var(--border-strong)" : "var(--border-hairline)"),
      borderRadius: "var(--radius-lg)",
      padding: "var(--card-pad-lg)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-md)",
      boxShadow: featured ? "var(--elevation-1)" : "none",
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--mono-eyebrow-size)",
      lineHeight: "var(--mono-eyebrow-line)",
      textTransform: "uppercase",
      color: "var(--text-mute)",
      marginBottom: "var(--space-sm)"
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      alignItems: "baseline",
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--heading-lg-size)",
      lineHeight: "var(--heading-lg-line)",
      letterSpacing: "var(--heading-lg-track)",
      fontWeight: "var(--weight-semibold)",
      color: "var(--text-heading)"
    }
  }, price), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--body-md-size)",
      color: "var(--text-mute)"
    }
  }, cadence)), blurb && /*#__PURE__*/React.createElement("p", {
    style: {
      color: "var(--text-body)",
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)",
      marginTop: "var(--space-xs)"
    }
  }, blurb)), cta, /*#__PURE__*/React.createElement("ul", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-xs)"
    }
  }, features.map((t, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: "flex",
      gap: "var(--space-xs)",
      color: "var(--text-body)",
      fontSize: "var(--body-md-size)",
      lineHeight: "var(--body-md-line)"
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: "var(--text-link)",
      flex: "none"
    }
  }, "\u2014"), t))));
}
Object.assign(__ds_scope, { PricingCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/surfaces/PricingCard.jsx", error: String((e && e.message) || e) }); }

// components/typography/Eyebrow.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
function Eyebrow({
  children,
  style,
  ...rest
}) {
  return /*#__PURE__*/React.createElement("div", _extends({
    style: {
      fontFamily: "var(--font-mono)",
      fontSize: "var(--mono-eyebrow-size)",
      lineHeight: "var(--mono-eyebrow-line)",
      fontWeight: "var(--mono-eyebrow-weight)",
      textTransform: "uppercase",
      color: "var(--text-mute)",
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Eyebrow });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/typography/Eyebrow.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/AppShell.jsx
try { (() => {
(function () {
  const __ns = window.CareerPassportDesignSystem_a8d325;
  const Button = __ns.Button;
  const IconButton = __ns.IconButton;
  function AppShell({
    page,
    onNav,
    onSignOut,
    children
  }) {
    const items = [["passport", "Passport", "badge-check"], ["requests", "Requests", "inbox"], ["sharing", "Sharing", "share-2"]];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100vh",
        background: "var(--surface-page)"
      }
    }, /*#__PURE__*/React.createElement("header", {
      style: {
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--surface-page)",
        borderBottom: "1px solid var(--border-hairline)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-lg)",
        padding: "var(--space-sm) var(--space-lg)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontWeight: "var(--weight-semibold)",
        fontSize: 17,
        letterSpacing: "-0.6px",
        color: "var(--text-heading)"
      }
    }, "CareerPassport"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: "var(--text-faint)"
      }
    }, "/"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-md-size)",
        color: "var(--text-body)"
      }
    }, "Amara Osei"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost-sm"
    }, "Help"), /*#__PURE__*/React.createElement(Button, {
      variant: "primary-sm",
      onClick: () => onNav("requests")
    }, "Request verification"), /*#__PURE__*/React.createElement(IconButton, {
      label: "Sign out",
      onClick: onSignOut
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "log-out"
    }))), /*#__PURE__*/React.createElement("nav", {
      style: {
        display: "flex",
        gap: "var(--space-lg)",
        padding: "0 var(--space-lg)"
      }
    }, items.map(([k, label, icon]) => /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: () => onNav(k),
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-xs)",
        background: "none",
        border: "none",
        borderBottom: "1px solid " + (page === k ? "var(--border-strong)" : "transparent"),
        padding: "var(--space-xs) 0 10px",
        cursor: "pointer",
        color: page === k ? "var(--text-heading)" : "var(--text-body)",
        fontFamily: "var(--font-sans)",
        fontSize: "var(--body-md-size)"
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": icon
    }), label)))), /*#__PURE__*/React.createElement("main", {
      style: {
        maxWidth: 1080,
        margin: "0 auto",
        padding: "var(--space-xl) var(--space-lg) var(--space-4xl)"
      }
    }, children));
  }
  function StatusTag({
    state
  }) {
    const tone = state === "Verified" ? "var(--text-link)" : state === "Pending" ? "var(--warning-deep)" : "var(--text-mute)";
    const bg = state === "Verified" ? "var(--link-soft)" : state === "Pending" ? "var(--warning-soft)" : "var(--hairline-soft)";
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: "inline-flex",
        alignItems: "center",
        height: 22,
        padding: "0 8px",
        borderRadius: "var(--radius-sm)",
        background: bg,
        color: tone,
        fontFamily: "var(--font-mono)",
        fontSize: "var(--body-sm-size)",
        textTransform: "uppercase"
      }
    }, state);
  }
  Object.assign(window, {
    AppShell,
    StatusTag
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/AppShell.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/LoginScreen.jsx
try { (() => {
(function () {
  const __ns = window.CareerPassportDesignSystem_a8d325;
  const Card = __ns.Card;
  const TextInput = __ns.TextInput;
  const Button = __ns.Button;
  const Eyebrow = __ns.Eyebrow;
  function LoginScreen({
    onSignIn
  }) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        minHeight: "100vh",
        background: "var(--surface-page)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-lg)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      "aria-hidden": "true",
      style: {
        position: "absolute",
        inset: "-30% -10% auto -10%",
        height: "120%",
        background: "var(--gradient-mesh)",
        filter: "blur(48px)",
        opacity: 0.8
      }
    }), /*#__PURE__*/React.createElement(Card, {
      elevated: true,
      padding: "var(--space-xl)",
      style: {
        position: "relative",
        width: 400,
        borderRadius: "var(--radius-lg)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-md)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-xxs)"
      }
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "Sign in"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--heading-lg-size)",
        lineHeight: "var(--heading-lg-line)",
        letterSpacing: "var(--heading-lg-track)"
      }
    }, "CareerPassport")), /*#__PURE__*/React.createElement(TextInput, {
      label: "Work email",
      defaultValue: "amara@northwind.co"
    }), /*#__PURE__*/React.createElement(TextInput, {
      label: "Password",
      type: "password",
      defaultValue: "passport"
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      onClick: onSignIn
    }, "Sign in"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost-sm",
      block: true
    }, "Use a magic link instead"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-sm-size)",
        color: "var(--text-mute)",
        textAlign: "center"
      }
    }, "New here? Creating a passport is free."))));
  }
  Object.assign(window, {
    LoginScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/LoginScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/PassportScreen.jsx
try { (() => {
(function () {
  const __ns = window.CareerPassportDesignSystem_a8d325;
  const Card = __ns.Card;
  const Button = __ns.Button;
  const Eyebrow = __ns.Eyebrow;
  const IconButton = __ns.IconButton;
  function PassportScreen({
    records,
    onNav
  }) {
    const [open, setOpen] = React.useState(records[0].id);
    const verified = records.filter(r => r.state === "Verified").length;
    const rec = records.find(r => r.id === open);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-lg)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "var(--space-lg)",
        flexWrap: "wrap"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-xxs)"
      }
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "Your passport"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--heading-lg-size)",
        lineHeight: "var(--heading-lg-line)",
        letterSpacing: "var(--heading-lg-track)",
        whiteSpace: "nowrap"
      }
    }, verified, " of ", records.length, " verified")), /*#__PURE__*/React.createElement(Button, {
      variant: "primary-sm",
      onClick: () => onNav("requests")
    }, "Request verification")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.3fr 1fr",
        gap: "var(--space-md)",
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: "var(--space-xs)"
    }, records.map((r, i) => /*#__PURE__*/React.createElement("button", {
      key: r.id,
      onClick: () => setOpen(r.id),
      style: {
        width: "100%",
        textAlign: "left",
        background: open === r.id ? "var(--surface-well)" : "transparent",
        border: "none",
        borderBottom: i === records.length - 1 ? "none" : "1px solid var(--border-hairline)",
        borderRadius: "var(--radius-sm)",
        padding: "var(--space-sm) var(--space-md)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "var(--space-sm)",
        fontFamily: "var(--font-sans)"
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": r.icon,
      style: {
        color: "var(--text-mute)",
        flex: "none"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: "var(--body-md-size)",
        fontWeight: "var(--weight-medium)",
        color: "var(--text-heading)"
      }
    }, r.role), /*#__PURE__*/React.createElement("span", {
      style: {
        display: "block",
        fontSize: "var(--body-sm-size)",
        color: "var(--text-mute)"
      }
    }, r.org, " \xB7 ", r.years)), /*#__PURE__*/React.createElement(window.StatusTag, {
      state: r.state
    })))), /*#__PURE__*/React.createElement(Card, {
      padding: "var(--space-lg)",
      style: {
        position: "sticky",
        top: 100
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "var(--space-sm)"
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Eyebrow, null, "Record detail"), /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--heading-md-size)",
        lineHeight: "var(--heading-md-line)",
        letterSpacing: "var(--heading-md-track)",
        marginTop: "var(--space-xs)"
      }
    }, rec.role), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-body)",
        fontSize: "var(--body-md-size)"
      }
    }, rec.org, " \xB7 ", rec.years)), /*#__PURE__*/React.createElement(IconButton, {
      label: "More"
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "more-horizontal"
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-xs)",
        marginTop: "var(--space-md)"
      }
    }, rec.fields.map(([k, v]) => /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: "flex",
        justifyContent: "space-between",
        gap: "var(--space-sm)",
        padding: "var(--space-xs) 0",
        borderBottom: "1px solid var(--border-hairline)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-md-size)",
        color: "var(--text-mute)"
      }
    }, k), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-md-size)",
        color: "var(--text-heading)"
      }
    }, v)))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: "var(--space-md)",
        display: "flex",
        gap: "var(--space-xs)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "ghost-sm"
    }, "Edit"), rec.state === "Verified" ? /*#__PURE__*/React.createElement(Button, {
      variant: "ghost-sm"
    }, "Download proof") : /*#__PURE__*/React.createElement(Button, {
      variant: "primary-sm",
      onClick: () => onNav("requests")
    }, "Chase verifier")))));
  }
  Object.assign(window, {
    PassportScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/PassportScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/RequestsScreen.jsx
try { (() => {
(function () {
  const __ns = window.CareerPassportDesignSystem_a8d325;
  const Card = __ns.Card;
  const TextInput = __ns.TextInput;
  const Button = __ns.Button;
  const Eyebrow = __ns.Eyebrow;
  const CodeBlock = __ns.CodeBlock;
  function RequestsScreen() {
    const [sent, setSent] = React.useState(false);
    const rows = [["Northwind", "payroll@northwind.co", "Verified", "14 Aug 2026"], ["Halcyon", "j.reed@halcyon.io", "Verified", "02 Aug 2026"], ["University of Leeds", "registry@leeds.ac.uk", "Pending", "sent 3 days ago"], ["Meridian", "hr@meridian.com", "Expired", "12 Jun 2026"]];
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-lg)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-xxs)"
      }
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "Verification requests"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--heading-lg-size)",
        lineHeight: "var(--heading-lg-line)",
        letterSpacing: "var(--heading-lg-track)"
      }
    }, "Who has confirmed what")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.4fr 1fr",
        gap: "var(--space-md)",
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: "0"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1.4fr .7fr .9fr",
        gap: "var(--space-sm)",
        padding: "var(--space-sm) var(--space-md)",
        borderBottom: "1px solid var(--border-hairline)",
        fontFamily: "var(--font-mono)",
        fontSize: "var(--body-sm-size)",
        textTransform: "uppercase",
        color: "var(--text-mute)"
      }
    }, /*#__PURE__*/React.createElement("span", null, "Organisation"), /*#__PURE__*/React.createElement("span", null, "Contact"), /*#__PURE__*/React.createElement("span", null, "Status"), /*#__PURE__*/React.createElement("span", null, "Updated")), rows.map((r, i) => /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: "grid",
        gridTemplateColumns: "1.2fr 1.4fr .7fr .9fr",
        gap: "var(--space-sm)",
        alignItems: "center",
        padding: "var(--space-sm) var(--space-md)",
        borderBottom: i === rows.length - 1 ? "none" : "1px solid var(--border-hairline)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-md-size)",
        color: "var(--text-heading)"
      }
    }, r[0]), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-md-size)",
        color: "var(--text-body)"
      }
    }, r[1]), /*#__PURE__*/React.createElement(window.StatusTag, {
      state: r[2]
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-sm-size)",
        color: "var(--text-mute)"
      }
    }, r[3])))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-md)"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: "var(--space-lg)"
    }, sent ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-xs)"
      }
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "Request sent"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-body)"
      }
    }, "We emailed the verifier. You will see the status change here."), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost-sm",
      style: {
        justifySelf: "start"
      },
      onClick: () => setSent(false)
    }, "Send another")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-md)"
      }
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "New request"), /*#__PURE__*/React.createElement(TextInput, {
      label: "Organisation",
      placeholder: "Northwind"
    }), /*#__PURE__*/React.createElement(TextInput, {
      label: "Verifier email",
      placeholder: "payroll@northwind.co",
      hint: "Someone who can confirm dates and title."
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary-sm",
      onClick: () => setSent(true)
    }, "Send request"))), /*#__PURE__*/React.createElement(CodeBlock, {
      filename: "webhook.json"
    }, `{
  "event": "record.verified",
  "record": "rec_8f21",
  "org": "Northwind",
  "at": "2026-08-14T09:12:00Z"
}`))));
  }
  Object.assign(window, {
    RequestsScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/RequestsScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/app/SharingScreen.jsx
try { (() => {
(function () {
  const __ns = window.CareerPassportDesignSystem_a8d325;
  const Card = __ns.Card;
  const Button = __ns.Button;
  const Eyebrow = __ns.Eyebrow;
  const TextInput = __ns.TextInput;
  const CategoryPill = __ns.CategoryPill;
  function SharingScreen() {
    const [expiry, setExpiry] = React.useState("30 days");
    const [live, setLive] = React.useState(true);
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-lg)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-xxs)"
      }
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "Sharing"), /*#__PURE__*/React.createElement("h1", {
      style: {
        fontSize: "var(--heading-lg-size)",
        lineHeight: "var(--heading-lg-line)",
        letterSpacing: "var(--heading-lg-track)"
      }
    }, "One link, revocable")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-md)",
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: "var(--space-lg)"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-md)"
      }
    }, /*#__PURE__*/React.createElement(TextInput, {
      label: "Passport link",
      readOnly: true,
      value: "careerpassport.com/p/amara-osei"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-xs)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--label-sm-size)",
        fontWeight: "var(--label-sm-weight)",
        letterSpacing: "var(--label-sm-track)",
        color: "var(--text-heading)"
      }
    }, "Access expires after"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "var(--space-xs)"
      }
    }, ["7 days", "30 days", "Never"].map(o => /*#__PURE__*/React.createElement(CategoryPill, {
      key: o,
      active: expiry === o,
      onClick: () => setExpiry(o)
    }, o)))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "var(--space-xs)"
      }
    }, /*#__PURE__*/React.createElement(Button, {
      variant: "primary-sm"
    }, "Copy link"), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost-sm",
      onClick: () => setLive(!live)
    }, live ? "Turn off link" : "Turn link on")), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--body-sm-size)",
        textTransform: "uppercase",
        color: live ? "var(--text-link)" : "var(--text-mute)"
      }
    }, live ? "Link is live · " + expiry : "Link is off"))), /*#__PURE__*/React.createElement(Card, {
      padding: "var(--space-lg)"
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "Recent views"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-xs)",
        marginTop: "var(--space-sm)"
      }
    }, [["Kestrel Talent", "today, 09:41"], ["Verve", "yesterday"], ["Meridian", "12 Aug 2026"]].map(([a, b]) => /*#__PURE__*/React.createElement("div", {
      key: a,
      style: {
        display: "flex",
        justifyContent: "space-between",
        padding: "var(--space-xs) 0",
        borderBottom: "1px solid var(--border-hairline)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-md-size)",
        color: "var(--text-heading)"
      }
    }, a), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-sm-size)",
        color: "var(--text-mute)"
      }
    }, b)))))));
  }
  Object.assign(window, {
    SharingScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/app/SharingScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/EmployersScreen.jsx
try { (() => {
(function () {
  const __ns = window.CareerPassportDesignSystem_a8d325;
  const HeroBand = __ns.HeroBand;
  const Card = __ns.Card;
  const TextInput = __ns.TextInput;
  const Button = __ns.Button;
  const Eyebrow = __ns.Eyebrow;
  const LogoStrip = __ns.LogoStrip;
  function EmployersScreen() {
    const [sent, setSent] = React.useState(false);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(HeroBand, {
      mesh: false,
      eyebrow: "For employers",
      headline: "Read the record, not the reference.",
      sub: "Verified employment and education, delivered with the application."
    }), /*#__PURE__*/React.createElement("section", {
      style: {
        borderTop: "1px solid var(--border-hairline)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-4xl) var(--space-lg)",
        display: "grid",
        gridTemplateColumns: "1fr 420px",
        gap: "var(--space-3xl)",
        alignItems: "start"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-xl)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-sm)",
        maxWidth: 520
      }
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "What changes"), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--heading-lg-size)",
        lineHeight: "var(--heading-lg-line)",
        letterSpacing: "var(--heading-lg-track)"
      }
    }, "Nine days out of every offer"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-body)",
        fontSize: "var(--body-lg-size)",
        lineHeight: "var(--body-lg-line)"
      }
    }, "Reference checks are the last unautomated step in hiring. CareerPassport moves them to the front, once, and keeps the result.")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-md)"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      eyebrow: "Before offer",
      title: "Pre-verified applicants"
    }, "Records arrive confirmed. No chasing former employers mid-process."), /*#__PURE__*/React.createElement(Card, {
      eyebrow: "Compliance",
      title: "Audit trail"
    }, "Every check is timestamped and attributable, exportable to your ATS."), /*#__PURE__*/React.createElement(Card, {
      eyebrow: "Fair hiring",
      title: "Same data for everyone"
    }, "Structured fields only, so candidates are compared on the same basis."), /*#__PURE__*/React.createElement(Card, {
      eyebrow: "Integration",
      title: "Works with your stack"
    }, "REST API and ATS export; no rip-and-replace."))), /*#__PURE__*/React.createElement(Card, {
      elevated: true,
      padding: "var(--space-xl)"
    }, /*#__PURE__*/React.createElement("h3", {
      style: {
        fontSize: "var(--heading-md-size)",
        lineHeight: "var(--heading-md-line)",
        letterSpacing: "var(--heading-md-track)",
        marginBottom: "var(--space-md)"
      }
    }, "Book a demo"), sent ? /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-xs)",
        padding: "var(--space-md) 0"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--mono-eyebrow-size)",
        textTransform: "uppercase",
        color: "var(--text-link)"
      }
    }, "Request received"), /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-body)"
      }
    }, "We will reply within one working day."), /*#__PURE__*/React.createElement(Button, {
      variant: "ghost-sm",
      onClick: () => setSent(false),
      style: {
        justifySelf: "start",
        marginTop: "var(--space-xs)"
      }
    }, "Send another")) : /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-md)"
      }
    }, /*#__PURE__*/React.createElement(TextInput, {
      label: "Full name",
      placeholder: "Amara Osei"
    }), /*#__PURE__*/React.createElement(TextInput, {
      label: "Work email",
      placeholder: "you@company.com",
      hint: "We only use this to arrange the call."
    }), /*#__PURE__*/React.createElement(TextInput, {
      label: "Hires per year",
      placeholder: "120"
    }), /*#__PURE__*/React.createElement(Button, {
      variant: "primary",
      block: true,
      onClick: () => setSent(true)
    }, "Request a demo"))))), /*#__PURE__*/React.createElement(LogoStrip, {
      label: "Hiring teams already reading verified records",
      names: ["Northwind", "Halcyon", "Meridian", "Verve", "Kestrel"]
    }));
  }
  Object.assign(window, {
    EmployersScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/EmployersScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/HomeScreen.jsx
try { (() => {
(function () {
  const __ns = window.CareerPassportDesignSystem_a8d325;
  const HeroBand = __ns.HeroBand;
  const LogoStrip = __ns.LogoStrip;
  const CtaBand = __ns.CtaBand;
  const Card = __ns.Card;
  const CodeBlock = __ns.CodeBlock;
  const CategoryPill = __ns.CategoryPill;
  const Button = __ns.Button;
  const Eyebrow = __ns.Eyebrow;
  function Section({
    eyebrow,
    title,
    sub,
    children,
    bordered
  }) {
    return /*#__PURE__*/React.createElement("section", {
      style: {
        borderTop: bordered ? "1px solid var(--border-hairline)" : "none"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-4xl) var(--space-lg)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-xl)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-sm)",
        maxWidth: 620
      }
    }, eyebrow && /*#__PURE__*/React.createElement(Eyebrow, null, eyebrow), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--heading-lg-size)",
        lineHeight: "var(--heading-lg-line)",
        letterSpacing: "var(--heading-lg-track)"
      }
    }, title), sub && /*#__PURE__*/React.createElement("p", {
      style: {
        color: "var(--text-body)",
        fontSize: "var(--body-lg-size)",
        lineHeight: "var(--body-lg-line)"
      }
    }, sub)), children));
  }
  function RecordRow({
    role,
    org,
    year,
    state
  }) {
    const tone = state === "Verified" ? "var(--text-link)" : "var(--text-mute)";
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-md)",
        padding: "var(--space-sm) 0",
        borderBottom: "1px solid var(--border-hairline)"
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": state === "Verified" ? "badge-check" : "clock",
      style: {
        color: tone,
        flex: "none"
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--body-md-size)",
        fontWeight: "var(--weight-medium)",
        color: "var(--text-heading)"
      }
    }, role), /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--body-sm-size)",
        color: "var(--text-mute)"
      }
    }, org, " \xB7 ", year)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--body-sm-size)",
        color: tone,
        textTransform: "uppercase"
      }
    }, state));
  }
  function HomeScreen({
    onNav
  }) {
    const [tab, setTab] = React.useState("Candidates");
    const copy = {
      Candidates: {
        title: "Claim your record once",
        sub: "Import your roles, invite the people who can confirm them, and keep the result for good."
      },
      Employers: {
        title: "Skip the reference chase",
        sub: "Every applicant arrives with employment dates and titles already confirmed."
      },
      Universities: {
        title: "Credentials that travel",
        sub: "Issue verifiable records your graduates can carry into any application."
      }
    }[tab];
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(HeroBand, {
      eyebrow: "Verified careers",
      headline: "Your work history, proven once.",
      sub: "CareerPassport turns scattered references into a single verified record candidates carry from application to application.",
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        onClick: () => onNav("pricing")
      }, "Get your passport"), /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => onNav("employers")
      }, "Book a demo"))
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "100%",
        maxWidth: 720,
        marginTop: "var(--space-lg)"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: "var(--space-lg)",
      style: {
        textAlign: "left",
        boxShadow: "var(--elevation-2)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "var(--space-sm)"
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--mono-eyebrow-size)",
        textTransform: "uppercase",
        color: "var(--text-mute)"
      }
    }, "Passport \xB7 Amara Osei"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: "var(--font-mono)",
        fontSize: "var(--mono-eyebrow-size)",
        color: "var(--text-link)"
      }
    }, "3 / 4 VERIFIED")), /*#__PURE__*/React.createElement(RecordRow, {
      role: "Staff Engineer",
      org: "Northwind",
      year: "2022 \u2014 now",
      state: "Verified"
    }), /*#__PURE__*/React.createElement(RecordRow, {
      role: "Senior Engineer",
      org: "Halcyon",
      year: "2019 \u2014 2022",
      state: "Verified"
    }), /*#__PURE__*/React.createElement(RecordRow, {
      role: "Engineer",
      org: "Meridian",
      year: "2017 \u2014 2019",
      state: "Verified"
    }), /*#__PURE__*/React.createElement(RecordRow, {
      role: "BSc Computer Science",
      org: "Leeds",
      year: "2013 \u2014 2017",
      state: "Pending"
    })))), /*#__PURE__*/React.createElement(LogoStrip, {
      label: "Trusted by hiring teams at",
      names: ["Northwind", "Halcyon", "Meridian", "Verve", "Kestrel"]
    }), /*#__PURE__*/React.createElement(Section, {
      bordered: true,
      eyebrow: "How verification works",
      title: "Three steps, once.",
      sub: "A record is confirmed by the organisation that issued it, then reused for every application after."
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "var(--space-md)"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      eyebrow: "Step 01",
      title: "Claim"
    }, "Import roles and study from your CV, or add them by hand in a minute."), /*#__PURE__*/React.createElement(Card, {
      eyebrow: "Step 02",
      title: "Verify"
    }, "We ask the employer or institution to confirm dates and title. Nothing else."), /*#__PURE__*/React.createElement(Card, {
      eyebrow: "Step 03",
      title: "Share"
    }, "Send one link. Employers see a confirmed record, not a promise."))), /*#__PURE__*/React.createElement(Section, {
      bordered: true,
      eyebrow: "Built for both sides",
      title: copy.title,
      sub: copy.sub
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "flex",
        gap: "var(--space-xs)",
        marginTop: "calc(var(--space-xl) * -1)"
      }
    }, ["Candidates", "Employers", "Universities"].map(t => /*#__PURE__*/React.createElement(CategoryPill, {
      key: t,
      active: tab === t,
      onClick: () => setTab(t)
    }, t))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1.1fr .9fr",
        gap: "var(--space-md)",
        alignItems: "stretch"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      padding: "var(--space-lg)"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-xs)"
      }
    }, [["Employment dates", "Confirmed by payroll contact"], ["Job title", "Confirmed by manager"], ["Right to work", "Document checked"], ["Education", "Confirmed by registrar"]].map(([a, b]) => /*#__PURE__*/React.createElement("div", {
      key: a,
      style: {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-xs)",
        padding: "var(--space-xs) 0",
        borderBottom: "1px solid var(--border-hairline)"
      }
    }, /*#__PURE__*/React.createElement("i", {
      "data-lucide": "badge-check",
      style: {
        color: "var(--text-link)",
        flex: "none"
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-md-size)",
        color: "var(--text-heading)",
        flex: 1
      }
    }, a), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: "var(--body-sm-size)",
        color: "var(--text-mute)"
      }
    }, b))))), /*#__PURE__*/React.createElement(CodeBlock, {
      filename: "verify.ts"
    }, `import { passport } from "@careerpassport/sdk";

const record = await passport.verify({
  candidate: "amara-osei",
  fields: ["employment", "education"]
});

record.status;   // "verified"
record.checkedAt // 2026-08-14T09:12:00Z`))), /*#__PURE__*/React.createElement(Section, {
      bordered: true,
      eyebrow: "Case study",
      title: "Northwind cut time-to-offer by nine days.",
      sub: "Their recruiters stopped emailing former employers and started reading a confirmed record instead."
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "var(--space-md)"
      }
    }, [["9 days", "faster to offer"], ["94%", "of references resolved without email"], ["1,200", "records verified in year one"]].map(([n, l]) => /*#__PURE__*/React.createElement(Card, {
      key: n,
      padding: "var(--space-lg)"
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: "var(--heading-lg-size)",
        lineHeight: "var(--heading-lg-line)",
        letterSpacing: "var(--heading-lg-track)",
        fontWeight: "var(--weight-semibold)",
        color: "var(--text-heading)"
      }
    }, n), /*#__PURE__*/React.createElement("div", {
      style: {
        color: "var(--text-mute)",
        fontSize: "var(--body-md-size)",
        marginTop: "var(--space-xxs)"
      }
    }, l))))), /*#__PURE__*/React.createElement(CtaBand, {
      headline: "Start your passport",
      sub: "Free for candidates, always.",
      actions: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        onClick: () => onNav("pricing")
      }, "Get your passport"), /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        onClick: () => onNav("employers")
      }, "Talk to us"))
    }));
  }
  Object.assign(window, {
    HomeScreen,
    Section,
    RecordRow
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/website/PricingScreen.jsx
try { (() => {
(function () {
  const __ns = window.CareerPassportDesignSystem_a8d325;
  const HeroBand = __ns.HeroBand;
  const PricingCard = __ns.PricingCard;
  const Card = __ns.Card;
  const Button = __ns.Button;
  const Eyebrow = __ns.Eyebrow;
  const CategoryPill = __ns.CategoryPill;
  function PricingScreen({
    onNav
  }) {
    const [cadence, setCadence] = React.useState("Monthly");
    const mult = cadence === "Monthly" ? 1 : 10;
    const suffix = cadence === "Monthly" ? "/mo" : "/yr";
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(HeroBand, {
      mesh: false,
      eyebrow: "Pricing",
      headline: "Free to carry. Priced to hire.",
      sub: "Candidates never pay. Employers pay for the seats that read verified records.",
      style: {
        paddingBottom: 0
      },
      actions: /*#__PURE__*/React.createElement("div", {
        style: {
          display: "flex",
          gap: "var(--space-xs)"
        }
      }, ["Monthly", "Yearly"].map(c => /*#__PURE__*/React.createElement(CategoryPill, {
        key: c,
        active: cadence === c,
        onClick: () => setCadence(c)
      }, c)))
    }), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "0 var(--space-lg) var(--space-4xl)",
        display: "grid",
        gridTemplateColumns: "repeat(3,1fr)",
        gap: "var(--space-md)"
      }
    }, /*#__PURE__*/React.createElement(PricingCard, {
      name: "Candidate",
      price: "Free",
      cadence: "forever",
      blurb: "Everything a person needs to prove their own history.",
      features: ["Unlimited verified records", "One shareable passport link", "Revoke access any time"],
      cta: /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        block: true,
        onClick: () => onNav("home")
      }, "Create a passport")
    }), /*#__PURE__*/React.createElement(PricingCard, {
      featured: true,
      name: "Team",
      price: "$" + 40 * mult,
      cadence: suffix,
      blurb: "For hiring teams replacing the reference chase.",
      features: ["5 recruiter seats", "Unlimited verification requests", "Shared shortlists", "ATS export"],
      cta: /*#__PURE__*/React.createElement(Button, {
        variant: "primary",
        block: true
      }, "Start free trial")
    }), /*#__PURE__*/React.createElement(PricingCard, {
      name: "Enterprise",
      price: "Custom",
      cadence: "",
      blurb: "For regulated hiring at scale.",
      features: ["SSO and audit log", "Bulk right-to-work checks", "API access", "Named support"],
      cta: /*#__PURE__*/React.createElement(Button, {
        variant: "secondary",
        block: true,
        onClick: () => onNav("employers")
      }, "Contact sales")
    }))), /*#__PURE__*/React.createElement("section", {
      style: {
        borderTop: "1px solid var(--border-hairline)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        maxWidth: "var(--container-max)",
        margin: "0 auto",
        padding: "var(--space-4xl) var(--space-lg)",
        display: "grid",
        gap: "var(--space-xl)"
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gap: "var(--space-sm)",
        maxWidth: 560
      }
    }, /*#__PURE__*/React.createElement(Eyebrow, null, "Common questions"), /*#__PURE__*/React.createElement("h2", {
      style: {
        fontSize: "var(--heading-lg-size)",
        lineHeight: "var(--heading-lg-line)",
        letterSpacing: "var(--heading-lg-track)"
      }
    }, "Before you pick a plan")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "var(--space-md)"
      }
    }, /*#__PURE__*/React.createElement(Card, {
      title: "Who confirms a record?"
    }, "The organisation named on it \u2014 a payroll contact, manager or registrar. Never a colleague of the candidate's choosing."), /*#__PURE__*/React.createElement(Card, {
      title: "What do employers see?"
    }, "Dates, title and institution. No documents, no salary, no contact details unless the candidate shares them."), /*#__PURE__*/React.createElement(Card, {
      title: "Can a candidate revoke access?"
    }, "Yes. A passport link can be turned off at any time, and access expires by default after 30 days."), /*#__PURE__*/React.createElement(Card, {
      title: "Do you charge per verification?"
    }, "No. Team and Enterprise seats include unlimited requests.")))));
  }
  Object.assign(window, {
    PricingScreen
  });
})();
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/website/PricingScreen.jsx", error: String((e && e.message) || e) }); }

__ds_ns.CtaBand = __ds_scope.CtaBand;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.HeroBand = __ds_scope.HeroBand;

__ds_ns.LogoStrip = __ds_scope.LogoStrip;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.CategoryPill = __ds_scope.CategoryPill;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.TextInput = __ds_scope.TextInput;

__ds_ns.NavBar = __ds_scope.NavBar;

__ds_ns.NavLink = __ds_scope.NavLink;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.CodeBlock = __ds_scope.CodeBlock;

__ds_ns.PricingCard = __ds_scope.PricingCard;

__ds_ns.Eyebrow = __ds_scope.Eyebrow;

})();
