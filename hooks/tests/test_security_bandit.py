"""Tests for security_bandit module."""

from security_bandit import check_bandit


class TestB101Assert:
    def test_assert_in_non_test_file(self):
        source = "def check():\n    assert x > 0\n"
        result = check_bandit("app.py", source)
        kinds = [s.kind for s in result]
        assert "B101" in kinds

    def test_assert_in_test_file_skipped(self):
        source = "def test_check():\n    assert x > 0\n"
        result = check_bandit("test_app.py", source)
        kinds = [s.kind for s in result]
        assert "B101" not in kinds


class TestB102ExecEval:
    def test_exec_detected(self):
        source = "exec('print(1)')\n"
        result = check_bandit("app.py", source)
        kinds = [s.kind for s in result]
        assert "B102" in kinds

    def test_eval_detected(self):
        source = "x = eval(user_input)\n"
        result = check_bandit("app.py", source)
        kinds = [s.kind for s in result]
        assert "B102" in kinds


class TestB105HardcodedPassword:
    def test_password_assignment_detected(self):
        source = "password = 'super_secret'\n"
        result = check_bandit("app.py", source)
        kinds = [s.kind for s in result]
        assert "B105" in kinds

    def test_non_password_variable_clean(self):
        source = "username = 'admin'\n"
        result = check_bandit("app.py", source)
        kinds = [s.kind for s in result]
        assert "B105" not in kinds


class TestB110ExceptPass:
    def test_except_pass_detected(self):
        source = "try:\n    x()\nexcept:\n    pass\n"
        result = check_bandit("app.py", source)
        kinds = [s.kind for s in result]
        assert "B110" in kinds

    def test_except_with_handler_clean(self):
        source = "try:\n    x()\nexcept Exception as e:\n    log(e)\n"
        result = check_bandit("app.py", source)
        kinds = [s.kind for s in result]
        assert "B110" not in kinds


class TestB301Pickle:
    def test_pickle_loads_detected(self):
        source = "import pickle\nx = pickle.loads(data)\n"
        result = check_bandit("app.py", source)
        kinds = [s.kind for s in result]
        assert "B301" in kinds


class TestB602SubprocessShell:
    def test_shell_true_detected(self):
        source = "import subprocess\nsubprocess.run(cmd, shell=True)\n"
        result = check_bandit("app.py", source)
        kinds = [s.kind for s in result]
        assert "B602" in kinds

    def test_shell_false_clean(self):
        source = "import subprocess\nsubprocess.run(cmd, shell=False)\n"
        result = check_bandit("app.py", source)
        kinds = [s.kind for s in result]
        assert "B602" not in kinds


class TestSyntaxError:
    def test_syntax_error_returns_empty(self):
        assert check_bandit("app.py", "def broken(:\n") == []
