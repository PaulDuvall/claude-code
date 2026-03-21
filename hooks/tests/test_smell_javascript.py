"""Tests for smell_javascript module."""

from smell_javascript import check_javascript


class TestCheckJavascript:
    """Tests for the native JS/TS code smell checker."""

    def test_simple_function_no_smells(self):
        source = "function hello() {\n  return 1;\n}\n"
        result = check_javascript("test.js", source)
        assert result == []

    def test_arrow_function_no_smells(self):
        source = "const hello = () => {\n  return 1;\n};\n"
        result = check_javascript("test.js", source)
        assert result == []

    def test_complex_function_detected(self):
        branches = "\n".join(
            f"  if (x === {i}) return {i};" for i in range(12)
        )
        source = f"function complexFunc(x) {{\n{branches}\n}}\n"
        result = check_javascript("test.js", source)
        kinds = [s.kind for s in result]
        assert "complexity" in kinds

    def test_long_function_detected(self):
        lines = "\n".join(f"  const x{i} = {i};" for i in range(25))
        source = f"function longFunc() {{\n{lines}\n}}\n"
        result = check_javascript("test.js", source)
        kinds = [s.kind for s in result]
        assert "long_function" in kinds

    def test_deep_nesting_detected(self):
        source = (
            "function nested() {\n"
            "  if (a) {\n"
            "    if (b) {\n"
            "      if (c) {\n"
            "        if (d) {\n"
            "          return 1;\n"
            "        }\n"
            "      }\n"
            "    }\n"
            "  }\n"
            "}\n"
        )
        result = check_javascript("test.js", source)
        kinds = [s.kind for s in result]
        assert "deep_nesting" in kinds

    def test_too_many_params_detected(self):
        source = "function many(a, b, c, d, e) {\n  return 1;\n}\n"
        result = check_javascript("test.js", source)
        kinds = [s.kind for s in result]
        assert "too_many_params" in kinds

    def test_class_method_detected(self):
        source = (
            "class Foo {\n"
            "  myMethod(a, b, c, d, e) {\n"
            "    return 1;\n"
            "  }\n"
            "}\n"
        )
        result = check_javascript("test.ts", source)
        kinds = [s.kind for s in result]
        assert "too_many_params" in kinds

    def test_async_function_detected(self):
        branches = "\n".join(
            f"  if (x === {i}) return {i};" for i in range(12)
        )
        source = f"async function fetchData(x) {{\n{branches}\n}}\n"
        result = check_javascript("test.js", source)
        kinds = [s.kind for s in result]
        assert "complexity" in kinds

    def test_arrow_callbacks_not_merged(self):
        source = (
            "const a = (x) => {\n  return x + 1;\n};\n"
            "const b = (y) => {\n  return y + 2;\n};\n"
        )
        result = check_javascript("test.js", source)
        assert result == []

    def test_typescript_annotations_ignored(self):
        source = (
            "function greet(name: string, age: number)"
            ": void {\n  console.log(name);\n}\n"
        )
        result = check_javascript("test.ts", source)
        kinds = [s.kind for s in result]
        assert "too_many_params" not in kinds

    def test_export_function_detected(self):
        lines = "\n".join(f"  const x{i} = {i};" for i in range(25))
        source = f"export function longFunc() {{\n{lines}\n}}\n"
        result = check_javascript("test.ts", source)
        kinds = [s.kind for s in result]
        assert "long_function" in kinds

    def test_template_literal_not_confused(self):
        source = (
            "function greet(name) {\n"
            "  return `Hello ${name}!`;\n"
            "}\n"
        )
        result = check_javascript("test.js", source)
        assert result == []
