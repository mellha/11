const STORAGE_KEY = 'userJoinerData';

document.addEventListener('DOMContentLoaded', () => {
    const tokensEl = document.getElementById('user-tokens');
    const linksEl = document.getElementById('invite-links');
    const roleEl = document.getElementById('role-id');
    const saveBtn = document.getElementById('save-config');
    const statusEl = document.getElementById('status');
    const listEl = document.getElementById('server-list');

    // ロード
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
            // Token数に合わせてサーバー割り当て (例: Token1に最初のN個)
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
            statusEl.textContent = `${tokens.length} Token & ${invites.length} リンク保存したよ`;
        } else {
            statusEl.textContent = 'Tokenとリンク必須';
        }
    });

    function renderList(tokens, groupedServers) {
        listEl.innerHTML = '';
        tokens.forEach((token, i) => {
            const group = document.createElement('div');
            group.className = 'token-group';
            group.innerHTML = `<h3>Token ${i+1} (${token.substring(0, 10)}...)</h3>`;
            groupedServers[i].forEach(server => {
                const card = document.createElement('div');
                card.className = 'server-card';
                card.innerHTML = `
                    <div class="server-name">${server.name}</div>
                    <a href="${server.invite}" class="join-button" target="_blank" onclick="autoJoin('${token}', '${server.invite}')" rel="noopener">
                        自動参加
                    </a>
                `;
                group.appendChild(card);
            });
            listEl.appendChild(group);
        });
    }

    // 自動参加シミュ (ローカルself-botで実装)
    window.autoJoin = (token, invite) => {
        console.log(`Token: ${token} で ${invite} に参加中... (ロール: ${saved.roleId})`);
        statusEl.textContent = '参加処理開始 (コンソール確認)';
    };

    // 初期レンダー
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