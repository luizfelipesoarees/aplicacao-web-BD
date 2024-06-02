const ComponenteLogin = {
    template: `
        <div class="componente">
            <h1>Login</h1>
            <form @submit.prevent="login">
                <input type="text" v-model="username" placeholder="Usuário" required />
                <input type="password" v-model="password" placeholder="Senha" required />
                <button type="submit">Entrar</button>
            </form>
        </div>
    `,
    data() {
        return {
            username: '',
            password: ''
        };
    },
    methods: {
        async login() {
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: this.username, password: this.password })
                });
                if (response.ok) {
                    const data = await response.json();
                    alert('Login realizado com sucesso!');
                    // Redirecionar para a página do jogo ou dashboard
                    window.location.href = 'jogo.html';
                } else {
                    alert('Erro ao fazer login. Verifique suas credenciais.');
                }
            } catch (error) {
                console.error('Erro ao fazer login:', error);
            }
        }
    }
};

const ComponenteSignIn = {
    template: `
        <div class="componente">
            <h1>Cadastre-se</h1>
            <form @submit.prevent="register">
                <input type="text" v-model="username" placeholder="Usuário" required />
                <input type="password" v-model="password" placeholder="Senha" required />
                <input type="password" v-model="confirmPassword" placeholder="Confirme a senha" required />
                <button type="submit">Cadastrar</button>
            </form>
        </div>
    `,
    data() {
        return {
            username: '',
            password: '',
            confirmPassword: ''
        };
    },
    methods: {
        async register() {
            if (this.password !== this.confirmPassword) {
                alert('As senhas não coincidem.');
                return;
            }

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username: this.username, password: this.password })
                });
                if (response.ok) {
                    alert('Usuário registrado com sucesso!');
                    // Redirecionar para a página de login
                    window.location.href = '/login';
                } else {
                    alert('Erro ao registrar usuário.');
                }
            } catch (error) {
                console.error('Erro ao registrar usuário:', error);
            }
        }
    }
};

const { createApp } = Vue;

createApp({
    data() {
        return {
            componenteAtual: "ComponenteLogin",
            textoBotao: "Não tenho cadastro"
        };
    },
    methods: {
        alterarComponentes() {
            if (this.componenteAtual === "ComponenteLogin") {
                this.componenteAtual = "ComponenteSignIn";
                this.textoBotao = "Já possuo cadastro";
            } else {
                this.componenteAtual = "ComponenteLogin";
                this.textoBotao = "Não tenho cadastro";
            }
        }
    },
    components: {
        ComponenteLogin,
        ComponenteSignIn
    }
}).mount("#app");
