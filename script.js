const STORAGE_KEY = 'userJoinerData';

document.addEventListener('DOMContentLoaded', () => {
    const tokensEl = document.getElementById('user-tokens');
    const linksEl = document.getElementById('invite-links');
    const roleEl = document.getElementById('role-id');
    const saveBtn = document.getElementById('save-config');
    const statusEl = document.getElementById('status');
    const listEl = document.getElementById('server-list');

    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { roleId: '', tokens: [], servers: [] };
    roleEl.value = saved.roleId;
    tokensEl.value = saved.tokens.join('\n');
    linksEl.value = saved.servers.join('\n');

    saveBtn.addEventListener('click', () => {
        const roleId = roleEl.value.trim();
        const tokensText = tokensEl.value.trim();
        const linksText = linksEl.value.trim();
        const tokens = tokensText.split('\n').map(t => t.trim()).filter(t => t);
        const invites = linksText.split('\n').map(l => l.trim()).filter(l => l);

        if (tokens.length > 0 && invites.length > 0) {
            const numTokens = tokens.length;
            const serversPerToken = Math.ceil(invites.length / numTokens);
            const groupedServers = [];
            for (let i = 0; i < numTokens; i++) {
                const start = i * serversPerToken;
                const end = start + serversPerToken;
                groupedServers.push(invites.slice(start, end).map((invite, j) => ({
                    name: `サーバー ${i+1}-${j+1}`,
                    invite: invite
                })));
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify({ roleId, tokens, servers: invites }));
            renderList(tokens, groupedServers);
            statusEl.textContent = `保存完了！ ${tokens.length} Tokenで${invites.length}サーバーを割り当てました。`;
            statusEl.style.color = '#43b581';
        } else {
            statusEl.textContent = 'Tokenとリンクを入れてください';
            statusEl.style.color = '#f04747';
        }
    });

    function renderList(tokens, groupedServers) {
        listEl.innerHTML = '';
        tokens.forEach((token, i) => {
            if (groupedServers[i].length === 0) return;
            const group = document.createElement('div');
            group.className = 'token-group';
            group.innerHTML = `<h3>Token ${i+1} (${token.substring(0, 15)}...)</h3>`;
            groupedServers[i].forEach(server => {
                const card = document.createElement('div');
                card.className = 'server-card';
                card.innerHTML = `
                    <div class="server-name">${server.name}</div>
                    <button class="join-button" onclick="autoJoin('${token}', '${server.invite}', '${saved.roleId}')">
                        🚀 自動参加
                    </button>
                `;
                group.appendChild(card);
            });
            listEl.appendChild(group);
        });
    }

    window.autoJoin = (token, invite, roleId) => {
        console.log(`Token: ${token.substring(0, 20)}... で ${invite} に参加中... (ロール: ${roleId})`);
        statusEl.textContent = '参加開始！ コンソールを確認してね (Self-botで実装推奨)';
        statusEl.style.color = '#7289da';
    };

    if (saved.tokens.length > 0 && saved.servers.length > 0) {
        const numTokens = saved.tokens.length;
        const serversPerToken = Math.ceil(saved.servers.length / numTokens);
        const groupedServers = [];
        for (let i = 0; i < numTokens; i++) {
            const start = i * serversPerToken;
            const end = start + serversPerToken;
            groupedServers.push(saved.servers.slice(start, end).map((invite, j) => ({
                name: `サーバー ${i+1}-${j+1}`,
                invite: invite
            })));
        }
        renderList(saved.tokens, groupedServers);
    }
});
