const App = {};

App.client_id = 'Ov23li6b9Ca1RwO6WT0o'; 
App.client_secret = '5c9d650019848e52dc8a66059c3c0a68fd0f98dc';
App.baseApiUrl = 'https://api.github.com';

App.init = () => {
  $('#search-form').on('submit', function(e) {
    e.preventDefault();
    const username = $('input[name="username"]').val().trim();
    
    if(username) {
      // Reset UI
      $('#user-profile').empty();
      $('#repositories').empty();
      $('#repo-title').hide();
      $('#repo-count').remove(); // Odstranit počítadlo pokud existuje z minula
      $('.error-msg').remove();
      
      App.fetchUser(username);
    }
  });
};

App.fetchUser = (username) => {
  const url = `${App.baseApiUrl}/users/${username}?client_id=${App.client_id}&client_secret=${App.client_secret}`;
  
  $('#loader').show();

  $.ajax({
    url: url,
    method: 'GET',
    success: (user) => {
      App.renderUser(user);
      App.fetchRepositories(username);
    },
    error: (err) => {
      $('#loader').hide();
      $('#user-profile').html('<p class="error-msg">Uživatel nenalezen (404) nebo došlo k chybě.</p>');
    }
  });
};

App.renderUser = (user) => {
  const registeredDate = new Date(user.created_at).toLocaleDateString('cs-CZ');
  
  const rowStyle = "display: flex; padding: 8px; align-items: center;";
  const labelStyle = "width: 150px; font-weight: bold; background-color: #e0e0e0; padding: 8px; margin-right: 10px; border-radius: 4px 0 0 4px;";
  const valStyle = "flex: 1; font-weight: bold;";
  
  const createRow = (label, value) => `
    <div style="${rowStyle} margin-bottom: 5px; background-color: #f9f9f9;">
      <div style="width: 120px; background: #ddd; padding: 5px 10px; margin-right: 10px;">${label}</div>
      <div style="flex: 1; text-align: left; font-weight: 600;">${value || ''}</div>
    </div>
  `;

  const html = `
    <div style="border: 1px solid #ccc; background: #fff; margin-top: 20px;">
      <!-- Hlavička se jménem -->
      <div style="background-color: cadetblue; color: white; padding: 10px; text-align: left; font-weight: bold; font-size: 1.2em;">
        ${(user.name || user.login).toUpperCase()}
      </div>
      
      <div class="profile-content" style="display: flex; padding: 15px; flex-wrap: wrap;">
        <!-- Levý sloupec: Avatar a Tlačítko -->
        <div style="flex: 1; min-width: 200px; padding-right: 20px; display: flex; flex-direction: column;">
          <img src="${user.avatar_url}" alt="${user.login}" style="width: 100%; border: none; margin-bottom: 10px;">
          <a href="${user.html_url}" target="_blank" style="background-color: crimson; color: white; padding: 10px; text-decoration: none; border-radius: 4px; font-weight: bold; display: block; margin-top: auto;">View profile</a>
        </div>
        
        <!-- Pravý sloupec: Informace (Tabulka) -->
        <div style="flex: 2; min-width: 300px; display: flex; flex-direction: column; gap: 4px;">
           ${createRow('Login', user.login)}
           ${createRow('Bio', user.company)} <!-- Na obrázku je Bio často Company (@vuejs) -->
           ${createRow('Location', user.location)}
           ${createRow('Description', user.bio)}
           ${createRow('Email', user.email || user.blog)} <!-- Email je často skrytý, fallback na blog -->
           ${createRow('Followers', user.followers)}
           ${createRow('Registered', registeredDate)}
           
           <div style="${rowStyle} background-color: #f9f9f9;">
             <a href="${user.html_url}" style="color: blue; text-decoration: underline;">${user.html_url}</a>
           </div>
        </div>
      </div>
    </div>
  `;
  $('#user-profile').html(html);
};

App.fetchRepositories = (username) => {
  const url = `${App.baseApiUrl}/users/${username}/repos?sort=updated&per_page=30&client_id=${App.client_id}&client_secret=${App.client_secret}`;

  $.ajax({
    url: url,
    method: 'GET',
    success: (repos) => {
      $('#loader').hide();
      App.renderRepositories(repos);
    },
    error: (err) => {
      $('#loader').hide();
      $('#repositories').html('<p>Nepodařilo se načíst repozitáře.</p>');
    }
  });
};

App.renderRepositories = (repositories) => {
  if (repositories.length > 0) {
    $('#repo-title').show();
    if ($('#repo-count').length === 0) {
       $('#repo-title').after(`<p id="repo-count" style="margin-bottom: 20px;">This user has ${repositories.length} repositories</p>`);
    } else {
       $('#repo-count').text(`This user has ${repositories.length} repositories`);
    }

    const reposHtml = repositories.map((repo, index) => {
      const bg = index % 2 === 0 ? '#e0e0e0' : '#f4f4f4';
      
      return `
      <li style="background: ${bg}; padding: 10px 15px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
        <span style="font-weight: normal; color: #333;">${repo.name}</span>
        <a href="${repo.html_url}" target="_blank" style="color: blue; text-decoration: underline; font-size: 0.9em;">
          ${repo.url}
        </a>
      </li>
    `}).join('');
    
    $('#repositories').css({
        'list-style': 'none',
        'padding': '0',
        'display': 'block', 
        'grid-template-columns': 'none'
    }).html(reposHtml);
    
  } else {
    $('#repositories').html('<p>Uživatel nemá žádné veřejné repozitáře.</p>');
  }
};

$(document).ready(() => {
  App.init();
});