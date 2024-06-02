const { createApp } = Vue

createApp({
    data() {
        return {
            heroi: { vida: 100 },
            vilao: { vida: 100 },
            logAcoes: []
        }
    },
    methods: {
        atacar(isHeroi) {
            const alvo = isHeroi ? this.vilao : this.heroi;
            const dano = 10;
            
            alvo.vida -= dano;
            const acao = `${isHeroi ? 'Link' : 'Ganondorf'} atacou e causou ${dano} de dano.`;
            this.logAcao(acao, isHeroi ? 'Link' : 'Ganondorf');
            
            if (alvo.vida <= 0) {
                this.logAcao(`${isHeroi ? 'Link' : 'Ganondorf'} venceu!`, isHeroi ? 'Link' : 'Ganondorf');
            } else {
                this.acaoVilao();
            }
            this.salvarDadosJogo();
        },
        defender(isHeroi) {
            const personagem = isHeroi ? this.heroi : this.vilao;
            const danoReduzido = 5;
            personagem.vida -= danoReduzido;
            const acao = `${isHeroi ? 'Link' : 'Ganondorf'} defendeu e reduziu ${danoReduzido} de dano.`;
            this.logAcao(acao, isHeroi ? 'Link' : 'Ganondorf');
            this.salvarDadosJogo();
        },
        usarPocao(isHeroi) {
            const personagem = isHeroi ? this.heroi : this.vilao;
            const cura = 20;
            personagem.vida += cura;
            const acao = `${isHeroi ? 'Link' : 'Ganondorf'} usou uma poção e recuperou ${cura} de vida.`;
            this.logAcao(acao, isHeroi ? 'Link' : 'Ganondorf');
            this.salvarDadosJogo();
        },
        correr(isHeroi) {
            const acao = `${isHeroi ? 'Link' : 'Ganondorf'} decidiu correr.`;
            this.logAcao(acao, isHeroi ? 'Link' : 'Ganondorf');
            this.salvarDadosJogo();
        },
        acaoVilao() {
            const acoes = ['atacar', 'defender', 'usarPocao', 'correr', 'atacar', 'atacar'];
            const acaoAleatoria = acoes[Math.floor(Math.random() * acoes.length)];
            this[acaoAleatoria](false);
        },
        logAcao(acao, personagem) {
            this.logAcoes.push(acao);
            this.enviarLogServidor(acao, personagem);
        },
        async enviarLogServidor(acao, personagem) {
            try {
                await fetch('/logAcao', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ acao, personagem })
                });
            } catch (error) {
                console.error('Erro ao enviar log:', error);
            }
        },
        async salvarDadosJogo() {
            try {
                await fetch('/atualizarVida', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        vidaHeroi: this.heroi.vida,
                        vidaVilao: this.vilao.vida
                    })
                });
            } catch (error) {
                console.error('Erro ao salvar dados do jogo:', error);
            }
        }
    }
}).mount("#app");

// Código relacionado à dashboard
new Vue({
    el: '#dashboard',
    data: {
        logs: [] // Certifique-se de que esse é o nome certo para os seus logs
    },
    mounted() {
        this.fetchLogs();
    },
    methods: {
        async fetchLogs() {
            try {
                const response = await fetch('/logAcoes');
                const data = await response.json();
                this.logs = data.slice(0, 10); // Mostrar apenas os 10 logs mais recentes
            } catch (error) {
                console.error('Erro ao buscar logs:', error);
            }
        }
    }
});
