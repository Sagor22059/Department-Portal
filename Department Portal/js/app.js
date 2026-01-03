/**
 * ICT Department Portal - Main Application Logic
 */

const APP_KEY = 'ict_portal_data';
const SESSION_KEY = 'ict_portal_session';

// Mock Data
const INITIAL_DATA = {
    users: [
        {
            id: 1,
            name: 'System Admin',
            email: 'admin@ict.com',
            password: 'admin123',
            role: 'admin',
            designation: 'System Administrator',
            department: 'ICT Core',
            bio: 'Head of ICT Department. Responsible for system maintenance and security.',
            education: 'M.Sc. in Computer Science',
            research: 'Network Security, Cloud Computing',
            photo: null
        },
        {
            id: 2,
            name: 'John Doe',
            email: 'john.doe@ict.com',
            password: 'user123',
            role: 'user',
            designation: 'Senior Lecturer',
            department: 'Computer Science',
            bio: 'Passionate about teaching algorithms and data structures.',
            education: 'Ph.D. in Artificial Intelligence',
            research: 'Machine Learning, Neural Networks',
            photo: null
        },
        {
            id: 3,
            name: 'Sarah Smith',
            email: 'sarah.smith@ict.com',
            password: 'user123',
            role: 'user',
            designation: 'Assistant Professor',
            department: 'Software Engineering',
            bio: 'Focusing on software quality assurance and testing methodologies.',
            education: 'M.Sc. in Software Engineering',
            research: 'Software Testing, Agile Methodologies',
            photo: null
        },
        {
            id: 4,
            name: 'Michael Brown',
            email: 'michael.b@ict.com',
            password: 'user123',
            role: 'user',
            designation: 'Lab Instructor',
            department: 'Networks',
            bio: 'Managing the CCNA network lab and student projects.',
            education: 'B.Sc. in Computer Networks',
            research: 'IoT, Wireless Sensor Networks',
            photo: null
        },
        {
            id: 5,
            name: 'Emily Davis',
            email: 'emily.d@ict.com',
            password: 'user123',
            role: 'user',
            designation: 'Research Assistant',
            department: 'Data Science',
            bio: 'Working on big data analytics projects.',
            education: 'B.Sc. in Statistics',
            research: 'Big Data, Data Visualization',
            photo: null
        }
    ]
};

class App {
    constructor() {
        this.appElement = document.getElementById('app');
        this.data = this.loadData();
        this.currentUser = this.loadSession();

        // handle back/forward navigation for public profile pages
        window.addEventListener('popstate', (e) => {
            const state = e.state || {};
            if (state.page === 'faculty-profile' && state.id) {
                // render the profile page for the id
                this.renderFacultyProfilePage(state.id);
            } else if (state.page) {
                // navigate to a named public page if present
                this.navigatePublic(state.page);
            } else {
                // default home
                this.navigatePublic('home');
            }
        });

        this.init();
    }

    init() {
        if (!this.data) {
            this.saveData(INITIAL_DATA);
            this.data = INITIAL_DATA;
        }
        this.render();
    }

    loadData() {
        const stored = localStorage.getItem(APP_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    saveData(data) {
        localStorage.setItem(APP_KEY, JSON.stringify(data));
        this.data = data;
    }

    loadSession() {
        const stored = localStorage.getItem(SESSION_KEY);
        return stored ? JSON.parse(stored) : null;
    }

    setSession(user) {
        if (user) {
            localStorage.setItem(SESSION_KEY, JSON.stringify(user));
        } else {
            localStorage.removeItem(SESSION_KEY);
        }
        this.currentUser = user;
        this.render();
    }

    deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            this.data.users = this.data.users.filter(u => u.id !== userId);
            this.saveData(this.data);
            this.navigateAdmin('users');
        }
    }

    render() {
        this.appElement.innerHTML = '';
        // If guest or no user, show Public Website
        if (!this.currentUser || this.currentUser.role === 'guest') {
            this.renderPublicLayout();
        } else {
            // If logged in Admin/User, show Admin Dashboard
            this.renderAdminLayout();
        }
    }

    renderPublicLayout() {
        this.appElement.innerHTML = `
            <div class="dashboard-layout fade-in" style="flex-direction: column; display: flex; min-height: 100vh;">
                <header class="site-header">
                    <a href="#" class="site-logo" data-page="home" style="text-decoration: none;">
                        <img src="img/logo.png" alt="MBSTU Logo" style="width: 50px; height: 50px; object-fit: contain;">
                        <div style="display: flex; flex-direction: column; line-height: 1.2;">
                            <span style="font-size: 0.9rem; font-weight: 500; opacity: 0.9;">Mawlana Bhashani Science and Technology University</span>
                            <span style="font-size: 1.1rem; font-weight: 700;">Department of ICT</span>
                        </div>
                    </a>
                    <nav class="site-nav">
                        <a href="#" class="nav-item active" data-page="home">Home</a>
                        <a href="#" class="nav-item" data-page="faculty">Faculty</a>
                        <a href="#" class="nav-item" data-page="about">About</a>
                    </nav>
                    <a href="#" id="publicLoginBtn" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.9rem;">
                        Sign In
                    </a>
                </header>

                <main id="publicContent" style="flex: 1;">
                    <!-- Public Content Goes Here -->
                </main>

                <footer class="site-footer">
                    <div>© 2025 ICT Department. All rights reserved.</div>
                    <div style="opacity: 0.3; cursor: pointer;" title="Admin Access" id="adminLock">
                        <i class="ph ph-lock-key"></i>
                    </div>
                </footer>
            </div>
        `;

        // Event Listeners
        this.appElement.querySelectorAll('.site-nav .nav-item, .site-logo').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const page = el.dataset.page || 'home';
                this.navigatePublic(page);
            });
        });

        // Sign In Button
        this.appElement.querySelector('#publicLoginBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.renderLogin();
        });

        // Admin Lock
        this.appElement.querySelector('#adminLock').addEventListener('click', () => {
            this.renderLogin();
        });

        // Default to Home
        this.navigatePublic('home');

        // If the URL contains a direct faculty hash (e.g. #faculty-10), render that profile page
        try {
            const m = window.location.hash && window.location.hash.match(/^#faculty-(\d+)$/);
            if (m) {
                // render the profile page for this id
                this.renderFacultyProfilePage(m[1]);
            }
        } catch (err) {
            // ignore
        }
    }

    navigatePublic(pageId) {
        // Update Active State
        this.appElement.querySelectorAll('.site-nav .nav-item').forEach(el => el.classList.remove('active'));
        const activeLink = this.appElement.querySelector(`.site-nav .nav-item[data-page="${pageId}"]`);
        if (activeLink) activeLink.classList.add('active');

        const container = document.getElementById('publicContent');
        container.innerHTML = '';
        container.className = 'fade-in';

        if (pageId === 'home') {
            this.renderHome(container);
        } else if (pageId === 'faculty') {
            const facultyContainer = document.createElement('div');
            facultyContainer.style.padding = '3rem 2rem';
            facultyContainer.style.maxWidth = '1200px';
            facultyContainer.style.margin = '0 auto';
            this.renderFacultyPage(facultyContainer);
            container.appendChild(facultyContainer);
        } else if (pageId === 'about') {
            this.renderAboutPage(container);
        }
    }

    renderAboutPage(container) {
        container.innerHTML = `
            <div style="max-width: 1000px; margin: 0 auto; padding: 4rem 2rem;">
                <div style="text-align: center; margin-bottom: 4rem;" class="fade-in-up">
                    <h1 class="page-title" style="font-size: 2.5rem; margin-bottom: 1rem;">About Our Department</h1>
                    <p style="font-size: 1.1rem; color: var(--text-secondary); max-width: 700px; margin: 0 auto;">
                        Pioneering education and research in Information and Communication Technology since 2003.
                    </p>
                </div>

                <!-- Mission & Vision Cards -->
                <div class="about-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; margin-bottom: 5rem;">
                    <div class="glass-panel hover-scale" style="padding: 2.5rem; border-top: 4px solid var(--primary-color);">
                        <div class="stat-icon icon-blue" style="margin-bottom: 1.5rem;"><i class="ph ph-target"></i></div>
                        <h3>Our Mission</h3>
                        <p style="color: var(--text-secondary); margin-top: 1rem; line-height: 1.6;">
                            To produce globally competent ICT professionals through quality education, research, and innovation, contributing to the national and global sustainable development.
                        </p>
                    </div>
                    <div class="glass-panel hover-scale" style="padding: 2.5rem; border-top: 4px solid #10b981;">
                        <div class="stat-icon icon-green" style="margin-bottom: 1.5rem;"><i class="ph ph-eye"></i></div>
                        <h3>Our Vision</h3>
                        <p style="color: var(--text-secondary); margin-top: 1rem; line-height: 1.6;">
                            To be a center of excellence in Information and Communication Technology education and research, fostering a knowledge-based society.
                        </p>
                    </div>
                </div>

                <!-- History Timeline -->
                <div class="glass-panel" style="padding: 3rem; margin-bottom: 4rem;">
                    <h2 style="text-align: center; margin-bottom: 3rem;">Our Journey</h2>
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-date">2003</div>
                            <div class="timeline-content">
                                <h3>Department Established</h3>
                                <p>Started our journey with the first batch of 40 students.</p>
                            </div>
                        </div>
                         <div class="timeline-item">
                            <div class="timeline-date">2010</div>
                            <div class="timeline-content">
                                <h3>M.Sc. Program Launched</h3>
                                <p>Expanded our academic offerings to include postgraduate studies.</p>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-date">2018</div>
                            <div class="timeline-content">
                                <h3>International Accreditation</h3>
                                <p>Achieved BAETE accreditation for ensuring quality education.</p>
                            </div>
                        </div>
                        <div class="timeline-item">
                            <div class="timeline-date">2025</div>
                            <div class="timeline-content">
                                <h3>Digital Transformation</h3>
                                <p>Launching the new integrated digital portal for students and faculty.</p>
                            </div>
                        </div>
                    </div>
                </div>

                 <!-- Stats Section -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; text-align: center;">
                    <div class="stat-counter">
                        <div class="counter-value">800+</div>
                        <div class="counter-label">Graduates</div>
                    </div>
                    <div class="stat-counter">
                        <div class="counter-value">25+</div>
                        <div class="counter-label">Faculty Members</div>
                    </div>
                     <div class="stat-counter">
                        <div class="counter-value">10+</div>
                        <div class="counter-label">Research Labs</div>
                    </div>
                     <div class="stat-counter">
                        <div class="counter-value">100%</div>
                        <div class="counter-label">Job Placement</div>
                    </div>
                </div>
            </div>
        `;

        // wire tabs on profile page
        const pageTabs = container.querySelectorAll('.tab');
        pageTabs.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = btn.dataset.tab;
                container.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                container.querySelectorAll('.tab-content').forEach(tc => {
                    tc.classList.toggle('hidden', tc.dataset.content !== tab);
                });
            });
        });
    }


    renderHome(container) {
        container.innerHTML = `
            <div class="hero-section" style="background: linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url('img/home.jpg') no-repeat center center/cover; padding: 10rem 2rem; color: white;">
                <h1 class="hero-title" style="text-shadow: 0 4px 12px rgba(0,0,0,0.5);">Empowering the Future<br>Through Technology</h1>
                <p style="font-size: 1.25rem; color: #e2e8f0; max-width: 600px; margin: 0 auto 3rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">
                    Welcome to the official portal of the ICT Department. Discover our research, meet our faculty, and stay updated with the latest innovations.
                </p>
            </div>

            <!-- Features Grid -->
            <div style="padding: 4rem 2rem; max-width: 1400px; margin: 0 auto; display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                <div class="glass-panel" style="padding: 2rem;">
                    <div class="stat-icon icon-blue" style="margin-bottom: 1.5rem;"><i class="ph ph-student"></i></div>
                    <h3>Student Success</h3>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.5;">Providing world-class education and mentorship to nurture the next generation of tech leaders.</p>
                </div>
                 <div class="glass-panel" style="padding: 2rem;">
                    <div class="stat-icon icon-purple" style="margin-bottom: 1.5rem;"><i class="ph ph-atom"></i></div>
                    <h3>Research & Innovation</h3>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.5;">Leading groundbreaking research in AI, Networks, and Software Engineering.</p>
                </div>
                 <div class="glass-panel" style="padding: 2rem;">
                    <div class="stat-icon icon-green" style="margin-bottom: 1.5rem;"><i class="ph ph-globe"></i></div>
                    <h3>Global Community</h3>
                    <p style="color: var(--text-secondary); margin-top: 0.5rem; line-height: 1.5;">A diverse community of scholars and students connected to the global tech ecosystem.</p>
                </div>
            </div>
        `;
    }

    renderAdminLayout() {
        const initials = this.currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2);

        this.appElement.innerHTML = `
            <div class="dashboard-layout fade-in">
                <aside class="sidebar">
                    <div class="sidebar-header">
                        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Logo" style="width: 32px; height: 32px; filter: drop-shadow(0 0 5px rgba(99,102,241,0.5));">
                        <h2>ICT Admin</h2>
                    </div>
                    <nav class="sidebar-nav">
                        <a href="#" class="nav-item active" data-page="overview">
                            <i class="ph ph-squares-four"></i> Overview
                        </a>
                        <a href="#" class="nav-item" data-page="profile">
                            <i class="ph ph-user"></i> My Profile
                        </a>
                        ${this.currentUser.role === 'admin' ? `
                        <a href="#" class="nav-item" data-page="users">
                            <i class="ph ph-users"></i> User Management
                        </a>` : ''}
                        
                        <div style="flex: 1"></div>
                        
                        <a href="#" class="nav-item" id="logoutBtn">
                            <i class="ph ph-sign-out"></i> Logout
                        </a>
                    </nav>
                    <div class="user-info-mini">
                        <div class="user-avatar">${initials}</div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.9rem;">${this.currentUser.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary)">${this.currentUser.role.toUpperCase()}</div>
                        </div>
                    </div>
                </aside>
                <main class="main-content" id="mainContent">
                    <!-- Dynamic Page Content -->
                </main>
            </div>
        `;

        this.appElement.querySelectorAll('.nav-item[data-page]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateAdmin(item.dataset.page);
            });
        });

        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.setSession(null);
            // Will automatically re-render public layout due to setSession calling render()
        });

        // Default Page
        this.navigateAdmin('overview');
    }

    navigateAdmin(pageId) {
        this.appElement.querySelectorAll('.nav-item').forEach(el => {
            el.classList.remove('active');
            // Fix: remove local active style if any
        });
        const activeLink = this.appElement.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (activeLink) activeLink.classList.add('active');

        const contentContainer = document.getElementById('mainContent');
        contentContainer.className = 'main-content fade-in'; // Re-trigger animation

        // Reset content
        contentContainer.innerHTML = '';

        if (pageId === 'overview') {
            this.renderOverviewPage(contentContainer);
        } else if (pageId === 'profile') {
            this.renderProfilePage(contentContainer);
        } else if (pageId === 'users' && this.currentUser.role === 'admin') {
            this.renderUsersPage(contentContainer);
        }
    }

    renderLogin() {
        const container = document.createElement('div');
        container.className = 'login-container fade-in';
        container.innerHTML = `
            <div class="login-card glass-panel">
                <div class="login-icon">
                    <img src="img/logo.png" alt="ICT Logo" style="width: 80px; height: 80px; object-fit: contain; filter: drop-shadow(0 0 10px rgba(99,102,241,0.5));">
                </div>
                <h1>Portal Login</h1>
                <p>Restricted Access</p>
                <form id="loginForm">
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" name="email" class="form-input" placeholder="name@ict.com" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" name="password" class="form-input" placeholder="••••••••" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%">
                        <span>Sign In</span>
                        <i class="ph ph-arrow-right"></i>
                    </button>
                     <div style="text-align: center; margin-top: 1.5rem;">
                        <a href="#" id="backToHomeBtn" style="color: var(--text-secondary); text-decoration: none; font-size: 0.9rem;">
                            <i class="ph ph-arrow-left"></i> Back to Website
                        </a>
                    </div>
                    <p id="loginError" class="error-msg hidden">
                        <i class="ph ph-warning-circle"></i> Invalid credentials
                    </p>
                </form>
            </div>
        `;

        this.appElement.innerHTML = ''; // Clear current view
        this.appElement.appendChild(container);

        const form = container.querySelector('#loginForm');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(form.email.value, form.password.value);
        });

        container.querySelector('#backToHomeBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.setSession({
                name: 'Guest Visitor',
                role: 'guest',
                email: '',
                department: 'Public Visitor'
            });
        });
    }

    renderOverviewPage(container) {
        // Mock Stats Generation
        let stats = [];

        if (this.currentUser.role === 'admin') {
            stats = [
                { label: 'Total Users', value: this.data.users.length, icon: 'ph-users', color: 'blue' },
                { label: 'System Status', value: 'Online', icon: 'ph-activity', color: 'green' },
                { label: 'Pending Requests', value: '0', icon: 'ph-tray', color: 'purple' }
            ];
        } else if (this.currentUser.role === 'guest') {
            stats = [
                { label: 'Faculty Members', value: this.data.users.length, icon: 'ph-users-three', color: 'blue' },
                { label: 'Department Info', value: 'Public', icon: 'ph-info', color: 'green' },
                { label: 'Upcoming Events', value: '3', icon: 'ph-calendar', color: 'purple' }
            ];
        } else {
            stats = [
                { label: 'Profile Status', value: 'Active', icon: 'ph-check-circle', color: 'green' },
                { label: 'Department', value: this.currentUser.department || 'N/A', icon: 'ph-buildings', color: 'blue' }
            ];
        }

        const statsHtml = stats.map(stat => `
            <div class="stat-card glass-panel">
                <div class="stat-icon icon-${stat.color}">
                    <i class="ph ${stat.icon}"></i>
                </div>
                <div class="stat-info">
                    <h3>${stat.label}</h3>
                    <div class="value">${stat.value}</div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">Dashboard Overview</h2>
                <div style="color: var(--text-secondary)">${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            
            <div class="stats-grid">
                ${statsHtml}
            </div>

            <div class="glass-panel" style="padding: 2rem;">
                <h3 style="margin-bottom: 1rem; font-size: 1.1rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="ph ph-info"></i> Welcome back, ${this.currentUser.name}
                </h3>
                <p style="color: var(--text-secondary); max-width: 600px;">
                    ${this.currentUser.role === 'guest'
                ? 'You are viewing the public portal. Browse faculty information and department updates.'
                : 'This is your secure department portal. You can manage your profile, view department updates, and access internal resources.'}
                </p>
            </div>
        `;
    }

    renderFacultyPage(container) {
        const adminUser = this.data.users.find(u => u.role === 'admin');
        const facultyUsers = this.data.users.filter(u => u.role !== 'admin');

        const adminHtml = adminUser ? `
            <div style="margin-bottom: 3rem;">
                <h3 style="margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--glass-border);">Chairman</h3>
                <div class="faculty-card" data-id="${adminUser.id}">
                  <div class="glass-panel" style="display: flex; gap: 2rem; padding: 1.25rem; align-items: center; flex-wrap: wrap;">
                    <div class="user-avatar" style="width: 140px; height: 140px; font-size: 2.5rem; flex-shrink: 0; box-shadow: 0 8px 16px rgba(0,0,0,0.2); position: relative; overflow: hidden; border-radius:12px;">
                         ${adminUser.photo ? `<img src="${adminUser.photo}" style="width: 100%; height: 100%; border-radius: 12px; object-fit: cover;">` : `<div style="width: 100%; height: 100%; border-radius: 12px; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; font-size:2rem;">${adminUser.name.charAt(0)}</div>`}
                    </div>
                    <div style="flex: 1; min-width: 300px;">
                        <h3 style="font-size: 1.4rem; margin-bottom: 0.25rem;">${adminUser.name}</h3>
                        <div style="color: var(--primary-color); font-weight: 600; margin-bottom: 0.75rem; font-size: 1rem;">${adminUser.designation || ''}</div>
                        <p style="color: var(--text-secondary); margin-bottom: 1rem; max-width: 700px; line-height: 1.6;">${adminUser.bio || ''}</p>
                        <div style="font-size: 0.95rem; color: var(--text-secondary); display: flex; gap: 0.75rem; align-items:center;">
                            <a href="mailto:${adminUser.email}" class="btn btn-ghost" style="font-size:0.9rem;"><i class="ph ph-envelope"></i> Email</a>
                            <button class="btn btn-primary" style="font-size:0.9rem;">View Profile</button>
                        </div>
                        
                    </div>
                </div>
            </div>
        ` : '';

        const cards = facultyUsers
            .map(user => `
            <div class="faculty-card" data-id="${user.id}">
              <div class="glass-panel" style="padding: 0; overflow: hidden; display: flex; flex-direction: column;">
                <div style="padding: 1.5rem; display: flex; flex-direction: column; align-items: center; text-align: center; border-bottom: 1px solid var(--glass-border); background: linear-gradient(to bottom, rgba(255,255,255,0.03), transparent);">
                  <div class="user-avatar" style="width: 90px; height: 90px; font-size: 2rem; margin-bottom: 0.75rem; box-shadow: 0 8px 16px rgba(0,0,0,0.2); position: relative; overflow: hidden;">
                    ${user.photo ? `<img src="${user.photo}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : `<div style="width: 100%; height: 100%; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white;">${user.name.charAt(0)}</div>`}
                  </div>
                  <h3 style="margin-bottom: 0.25rem; font-size: 1.05rem;">${user.name}</h3>
                  <div style="color: var(--primary-color); font-weight: 600; font-size: 0.9rem;">${user.designation || 'Faculty Member'}</div>
                  <div style="color: var(--text-secondary); font-size: 0.82rem; margin-top: 0.25rem;">${user.department || ''}</div>
                  
                </div>
                <div style="padding: 0.75rem; background: rgba(0,0,0,0.02); text-align: center; display:flex; gap:0.5rem;">
                  <a href="mailto:${user.email}" class="btn btn-ghost" style="flex:1; font-size: 0.85rem;"> <i class="ph ph-envelope"></i> Email</a>
                  <button class="btn btn-primary" style="flex:1; font-size: 0.85rem;">View Profile</button>
                </div>
              </div>
            </div>
            `).join('');

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h2 class="page-title">Faculty Members</h2>
                    <p style="color: var(--text-secondary); margin-top: 0.25rem;">Meet our dedicated teaching and research staff</p>
                </div>
            </div>
            
            ${adminHtml}

            <div style="margin-bottom: 3rem;">
                <h3 style="margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--glass-border);">Faculty Members</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
                    ${cards}
                </div>
            </div>
        `;

        // Make faculty cards (including chairman) clickable to open detailed profile modal
        container.querySelectorAll('.faculty-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = parseInt(card.dataset.id, 10);
                if (!isNaN(id)) this.openProfileModal(id);
            });
        });

        // Ensure the 'View Profile' button explicitly opens modal without bubbling
        container.querySelectorAll('.faculty-card .btn.btn-primary').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.faculty-card');
                if (!card) return;
                const id = parseInt(card.dataset.id, 10);
                if (!isNaN(id)) this.navigateToProfilePage(id);
            });
        });
    }

    openProfileModal(userId) {
        const user = this.data.users.find(u => u.id === userId);
        if (!user) return;

        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content glass-panel">
                <button class="close-btn"><i class="ph ph-x"></i></button>
                <div class="profile-left">
                    <div class="profile-photo">
                        ${user.photo ? `<img src="${user.photo}" style="width:100%;height:100%;object-fit:cover;">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--primary-color);color:white;font-size:3rem;">${user.name.charAt(0)}</div>`}
                    </div>
                    <h3>${user.name}</h3>
                    <div class="subtitle">${user.designation || ''}</div>
                    <div class="contact">${user.department || ''}<br><a href="mailto:${user.email}" style="color:inherit;opacity:0.9;">${user.email}</a></div>
                    ${user.cv ? `<a href="${user.cv}" class="btn btn-primary download-btn" download target="_blank">DOWNLOAD CV</a>` : `<a href="#" class="btn btn-primary download-btn" style="opacity:0.6; pointer-events: none;">NO CV</a>`}
                </div>
                <div class="profile-right">
                    <div class="profile-section">
                        <h4>About Me</h4>
                        <p>${user.bio || 'No biography provided.'}</p>
                    </div>
                    <div class="profile-section">
                        <h4>Education</h4>
                        <p style="color:var(--text-secondary);">${user.education || 'N/A'}</p>
                    </div>
                    <div class="profile-section">
                        <h4>Research Interest</h4>
                        ${user.research ? `<ul style="color:var(--text-secondary);margin-left:1rem;">${user.research.split(',').map(r => `<li>${r.trim()}</li>`).join('')}</ul>` : `<p style="color:var(--text-secondary);">N/A</p>`}
                    </div>
                    <div class="profile-section">
                        <h4>Publications</h4>
                        <div class="tabs">
                            <button class="tab active" data-tab="journal">Journal Papers</button>
                            <button class="tab" data-tab="conference">Conference Papers</button>
                        </div>
                        <div class="tab-contents">
                            <div class="tab-content" data-content="journal">
                                ${user.publications && user.publications.journal ? user.publications.journal.map((p, i) => `
                                    <div class="pub-item">
                                        <div class="pub-year">${p.year}</div>
                                        <div class="pub-details">${p.text} ${p.link ? `<a href="${p.link}" target="_blank">Link</a>` : ''}</div>
                                    </div>
                                `).join('') : '<p style="color:var(--text-secondary);">No journal papers listed.</p>'}
                            </div>
                            <div class="tab-content hidden" data-content="conference">
                                ${user.publications && user.publications.conference ? user.publications.conference.map((p, i) => `
                                    <div class="pub-item">
                                        <div class="pub-year">${p.year}</div>
                                        <div class="pub-details">${p.text} ${p.link ? `<a href="${p.link}" target="_blank">Link</a>` : ''}</div>
                                    </div>
                                `).join('') : '<p style="color:var(--text-secondary);">No conference papers listed.</p>'}
                            </div>
                        </div>
                    </div>
                    <div class="profile-section">
                        <h4>Professional & Other Experiences</h4>
                        <div style="color:var(--text-secondary);">
                            ${Array.isArray(user.experiences) ? user.experiences.map(exp => `
                                <div class="exp-display-item">
                                    <div class="exp-display-header">
                                        <div class="exp-display-pos">${exp.position}</div>
                                        <div class="exp-display-date">${exp.start}${exp.end ? ' – ' + exp.end : ''}</div>
                                    </div>
                                    <div class="exp-display-inst">${exp.institution}</div>
                                </div>
                            `).join('') : (user.experiences ? `<div style="white-space: pre-line;">${user.experiences}</div>` : `<p>${user.designation ? `<strong style="color:var(--text-primary);">Current:</strong> ${user.designation}<br>` : ''}${user.department ? `<strong style="color:var(--text-primary);">Department:</strong> ${user.department}` : ''}</p>`)}
                        </div>
                    </div>
                </div>
            </div>
        `;

        const close = () => modal.remove();
        modal.querySelector('.close-btn').addEventListener('click', close);
        modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

        document.body.appendChild(modal);

        // Tab switching inside modal
        const tabButtons = modal.querySelectorAll('.tab');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = btn.dataset.tab;
                // toggle active class
                modal.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // show/hide contents
                modal.querySelectorAll('.tab-content').forEach(tc => {
                    tc.classList.toggle('hidden', tc.dataset.content !== tab);
                });
            });
        });
    }

    /* Navigate to a dedicated profile page (public view). Uses history.pushState so back works. */
    navigateToProfilePage(userId) {
        // update history state
        try {
            history.pushState({ page: 'faculty-profile', id: userId }, '', `#faculty-${userId}`);
        } catch (err) {
            // ignore
        }
        this.renderFacultyProfilePage(userId);
    }

    renderFacultyProfilePage(userId) {
        const user = this.data.users.find(u => u.id === parseInt(userId, 10));
        const container = document.getElementById('publicContent') || document.getElementById('mainContent');
        if (!user || !container) return;

        container.className = 'fade-in';
        container.innerHTML = `
            <div style="max-width: 1200px; margin: 0 auto; padding: 2.5rem;">
                <div style="display:flex; gap:2rem; align-items:flex-start;">
                    <div style="width:300px;">
                        <div class="glass-panel profile-left" style="padding:1.25rem;">
                            <div class="profile-photo" style="width:100%; height:260px; border-radius:8px; overflow:hidden; margin-bottom:1rem;">
                                ${user.photo ? `<img src="${user.photo}" style="width:100%;height:100%;object-fit:cover">` : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--primary-color);color:white;font-size:3rem;">${user.name.charAt(0)}</div>`}
                            </div>
                            <h2 style="margin:0 0 0.25rem 0">${user.name}</h2>
                            <div style="color:var(--primary-color); font-weight:600; margin-bottom:0.5rem">${user.designation || ''}</div>
                            <div style="color:var(--text-secondary); margin-bottom:0.75rem">${user.department || ''}</div>
                            <a href="mailto:${user.email}" class="btn btn-ghost" style="width:100%; margin-bottom:0.5rem"><i class="ph ph-envelope"></i> ${user.email}</a>
                            ${user.cv ? `<a href="${user.cv}" class="btn btn-primary" style="width:100%" download target="_blank">Download CV</a>` : ''}
                        </div>
                    </div>
                    <div style="flex:1;">
                        <div class="glass-panel profile-right" style="padding:1.5rem">
                            <div class="profile-section">
                                <h4>About Me</h4>
                                <p>${user.bio || 'No biography provided.'}</p>
                            </div>
                            <div class="profile-section">
                                <h4>Education</h4>
                                <p style="color:var(--text-secondary);">${user.education || 'N/A'}</p>
                            </div>
                            <div class="profile-section">
                                <h4>Research Interest</h4>
                                ${user.research ? `<ul style="color:var(--text-secondary);margin-left:1rem;">${user.research.split(',').map(r => `<li>${r.trim()}</li>`).join('')}</ul>` : `<p style="color:var(--text-secondary);">N/A</p>`}
                            </div>
                            <div class="profile-section">
                                <h4>Publications</h4>
                                <div class="tabs">
                                    <button class="tab active" data-tab="journal">Journal Papers</button>
                                    <button class="tab" data-tab="conference">Conference Papers</button>
                                </div>
                                <div class="tab-contents">
                                    <div class="tab-content" data-content="journal">
                                        ${user.publications && user.publications.journal ? user.publications.journal.map((p, i) => `
                                            <div class="pub-item">
                                                <div class="pub-year">${p.year}</div>
                                                <div class="pub-details">${p.text} ${p.link ? `<a href="${p.link}" target="_blank">Link</a>` : ''}</div>
                                            </div>
                                        `).join('') : '<p style="color:var(--text-secondary);">No journal papers listed.</p>'}
                                    </div>
                                    <div class="tab-content hidden" data-content="conference">
                                        ${user.publications && user.publications.conference ? user.publications.conference.map((p, i) => `
                                            <div class="pub-item">
                                                <div class="pub-year">${p.year}</div>
                                                <div class="pub-details">${p.text} ${p.link ? `<a href="${p.link}" target="_blank">Link</a>` : ''}</div>
                                            </div>
                                        `).join('') : '<p style="color:var(--text-secondary);">No conference papers listed.</p>'}
                                    </div>
                                </div>
                            </div>
                            <div class="profile-section">
                                <h4>Professional & Other Experiences</h4>
                                <div style="color:var(--text-secondary);">
                                    ${Array.isArray(user.experiences) ? user.experiences.map(exp => `
                                        <div class="exp-display-item">
                                            <div class="exp-display-header">
                                                <div class="exp-display-pos">${exp.position}</div>
                                                <div class="exp-display-date">${exp.start}${exp.end ? ' – ' + exp.end : ''}</div>
                                            </div>
                                            <div class="exp-display-inst">${exp.institution}</div>
                                        </div>
                                    `).join('') : (user.experiences ? `<div style="white-space: pre-line;">${user.experiences}</div>` : `<p>${user.education || ''}${user.designation ? `<br><strong style="color:var(--text-primary);">Current:</strong> ${user.designation}` : ''}${user.department ? `<br><strong style="color:var(--text-primary);">Department:</strong> ${user.department}` : ''}</p>`)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        // Wire tab buttons on the public profile page
        try {
            const tabs = container.querySelectorAll('.tab');
            tabs.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tab = btn.dataset.tab;
                    container.querySelectorAll('.tab').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    container.querySelectorAll('.tab-content').forEach(tc => {
                        tc.classList.toggle('hidden', tc.dataset.content !== tab);
                    });
                });
            });
        } catch (err) {
            // ignore
        }
    }

    renderProfilePage(container) {
        container.innerHTML = `
            <div class="page-header">
                <h2 class="page-title">My Profile</h2>
            </div>
            <div class="glass-panel" style="max-width: 1000px; padding: 2.5rem;">
                <form id="profileForm">
                    <div style="display: flex; gap: 2rem; margin-bottom: 2rem; align-items: center;">
                        <div class="user-avatar" style="width: 80px; height: 80px; font-size: 2rem; flex-shrink: 0; position: relative; overflow: hidden;">
                            ${this.currentUser.photo ? `<img id="previewImage" src="${this.currentUser.photo}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : `<div id="previewInitials" style="width: 100%; height: 100%; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white;">${this.currentUser.name.charAt(0)}</div>`}
                        </div>
                        <div style="flex: 1;">
                            <div class="form-group" style="margin-bottom: 0;">
                                <label class="form-label">Profile Photo</label>
                                <div style="display: flex; gap: 1rem;">
                                    <label class="btn btn-ghost" style="cursor: pointer;">
                                        <i class="ph ph-upload-simple"></i> Upload Image
                                        <input type="file" id="photoInput" accept="image/*" style="display: none;">
                                    </label>
                                    <button type="button" id="removePhotoBtn" class="btn btn-ghost" style="color: var(--error-color); ${!this.currentUser.photo ? 'display: none;' : ''}">
                                        <i class="ph ph-trash"></i> Remove
                                    </button>
                                </div>
                                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.5rem;">Recommended: Square JPG or PNG, max 1MB</p>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex; gap:2rem; align-items:flex-start; margin-bottom:1rem;">
                        <div style="flex:1">
                            <div class="form-group">
                                <label class="form-label">Upload CV / Resume</label>
                                <div style="display:flex; gap:0.75rem; align-items:center;">
                                    <label class="btn btn-ghost" style="cursor:pointer">
                                        <i class="ph ph-file-arrow-up"></i> Upload CV
                                        <input type="file" id="cvInput" accept=".pdf,.doc,.docx" style="display:none">
                                    </label>
                                    <button type="button" id="removeCvBtn" class="btn btn-ghost" style="display:${this.currentUser.cv ? 'inline-flex' : 'none'};">Remove CV</button>
                                    <div id="cvFilename" style="color:var(--text-secondary); font-size:0.85rem;">${this.currentUser.cv ? 'Uploaded CV' : 'No CV uploaded'}</div>
                                </div>
                                <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.5rem;">Accepted: PDF, DOC, DOCX. Max recommended size 2MB.</p>
                            </div>
                        </div>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <div class="form-group">
                            <label class="form-label">Full Name</label>
                            <input type="text" name="name" class="form-input" value="${this.currentUser.name}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email Address</label>
                            <input type="email" name="email" class="form-input" value="${this.currentUser.email}" readonly style="opacity: 0.7; cursor: not-allowed">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Designation</label>
                            <input type="text" name="designation" class="form-input" value="${this.currentUser.designation || ''}" placeholder="e.g. Senior Lecturer">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Department</label>
                            <input type="text" name="department" class="form-input" value="${this.currentUser.department || ''}">
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Educational Qualification</label>
                        <input type="text" name="education" class="form-input" value="${this.currentUser.education || ''}" placeholder="e.g. Ph.D. in Computer Science">
                    </div>

                    <div class="form-group">
                        <label class="form-label">Research Interests</label>
                        <textarea name="research" class="form-input" rows="2" placeholder="e.g. AI, Machine Learning, IoT">${this.currentUser.research || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Bio / Notes</label>
                        <textarea name="bio" class="form-input" rows="3" style="resize: vertical">${this.currentUser.bio || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label" style="display:flex; justify-content:space-between; align-items:center;">
                            Professional & Other Experiences
                            <button type="button" id="addExpBtn" class="btn btn-ghost" style="padding:0.4rem 0.8rem; font-size:0.8rem;">
                                <i class="ph ph-plus"></i> Add Experience
                            </button>
                        </label>
                        <div id="expContainer">
                            <!-- Structured experiences will be rendered here -->
                        </div>
                        <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.5rem;">Add your previous positions, institutions, and date ranges.</p>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Publications (Plain Text)</label>
                        <div id="plainEditor" style="display:block; margin-top:0.5rem;">
                            <div style="display:flex; gap:1rem; flex-wrap:wrap;">
                                <div style="flex:1; min-width:260px;">
                                    <strong>Journal Papers</strong>
                                    <textarea id="journalPlain" placeholder="Paste journal entries, one per line (e.g. '2024 - Title of paper | https://...')" style="width:100%; min-height:160px; margin-top:0.5rem; padding:0.75rem;"></textarea>
                                </div>
                                <div style="flex:1; min-width:260px;">
                                    <strong>Conference Papers</strong>
                                    <textarea id="conferencePlain" placeholder="Paste conference entries, one per line" style="width:100%; min-height:160px; margin-top:0.5rem; padding:0.75rem;"></textarea>
                                </div>
                            </div>
                        </div>
                        <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:0.5rem;">Paste each publication on its own line. Format suggestions: <em>2024 - Title | https://link</em> (year and link optional).</p>
                    </div>

                    <div style="display: flex; align-items: center; gap: 1rem; margin-top: 2rem;">
                        <button type="submit" class="btn btn-primary">
                            <i class="ph ph-floppy-disk"></i> Save Changes
                        </button>
                        <span id="saveMessage" style="color: var(--success-color); display: flex; align-items: center; gap: 0.5rem;" class="hidden">
                            <i class="ph ph-check-circle"></i> Saved successfully!
                        </span>
                    </div>
                </form>
            </div>
        `;

        let currentPhotoData = this.currentUser.photo;
        let currentCvData = this.currentUser.cv;

        // Handle File Selection
        const photoInput = container.querySelector('#photoInput');
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                if (file.size > 1024 * 1024) { // 1MB limit
                    alert('File is too large! Please choose an image under 1MB.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (readerEvent) => {
                    currentPhotoData = readerEvent.target.result;
                    // Update Preview
                    const avatarContainer = container.querySelector('.user-avatar');
                    avatarContainer.innerHTML = `<img src="${currentPhotoData}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                    container.querySelector('#removePhotoBtn').style.display = 'inline-flex';
                };
                reader.readAsDataURL(file);
            }
        });

        // Publications: plain-text editor only
        const journalPlainEl = container.querySelector('#journalPlain');
        const conferencePlainEl = container.querySelector('#conferencePlain');
        const existingPubs = this.currentUser.publications || {};
        // populate plain textareas from existing structured data
        try {
            const j = (existingPubs.journal || []).map(p => `${p.year ? p.year + ' - ' : ''}${p.text}${p.link ? ' | ' + p.link : ''}`).join('\n');
            const c = (existingPubs.conference || []).map(p => `${p.year ? p.year + ' - ' : ''}${p.text}${p.link ? ' | ' + p.link : ''}`).join('\n');
            if (journalPlainEl) journalPlainEl.value = j;
            if (conferencePlainEl) conferencePlainEl.value = c;
        } catch (err) {
            // ignore
        }

        // plain editor only (no toggle or structured rows)
        const plainEditorEl = container.querySelector('#plainEditor');

        // Handle Remove Photo
        container.querySelector('#removePhotoBtn').addEventListener('click', () => {
            currentPhotoData = null;
            const avatarContainer = container.querySelector('.user-avatar');
            avatarContainer.innerHTML = `<div style="width: 100%; height: 100%; border-radius: 50%; background: var(--primary-color); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem;">${this.currentUser.name.charAt(0)}</div>`;
            container.querySelector('#removePhotoBtn').style.display = 'none';
        });

        // CV upload handling
        const cvInput = container.querySelector('#cvInput');
        const cvFilenameEl = container.querySelector('#cvFilename');
        const removeCvBtn = container.querySelector('#removeCvBtn');

        if (cvInput) {
            cvInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                if (file.size > 2 * 1024 * 1024) {
                    alert('File is too large! Please choose a file under 2MB.');
                    return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    currentCvData = ev.target.result; // data URL
                    cvFilenameEl.textContent = file.name;
                    removeCvBtn.style.display = 'inline-flex';
                };
                reader.readAsDataURL(file);
            });
        }

        if (removeCvBtn) {
            removeCvBtn.addEventListener('click', () => {
                currentCvData = null;
                cvFilenameEl.textContent = 'No CV uploaded';
                removeCvBtn.style.display = 'none';
                const inp = container.querySelector('#cvInput'); if (inp) inp.value = '';
            });
        }

        // Experiences handling
        const expContainer = container.querySelector('#expContainer');
        const addExpBtn = container.querySelector('#addExpBtn');

        const createExpRow = (exp = { position: '', institution: '', start: '', end: '' }) => {
            const row = document.createElement('div');
            row.className = 'exp-row';
            row.innerHTML = `
                <button type="button" class="exp-remove"><i class="ph ph-trash"></i></button>
                <div class="exp-row-grid">
                    <div class="form-group" style="margin-bottom:0.5rem;">
                        <label class="form-label">Position</label>
                        <input type="text" class="form-input exp-position" value="${exp.position}" placeholder="e.g. Lecturer">
                    </div>
                    <div class="form-group" style="margin-bottom:0.5rem;">
                        <label class="form-label">Institution</label>
                        <input type="text" class="form-input exp-institution" value="${exp.institution}" placeholder="e.g. MBSTU">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label">Starting Date</label>
                        <input type="text" class="form-input exp-start" value="${exp.start}" placeholder="e.g. Jan 2020">
                    </div>
                    <div class="form-group" style="margin-bottom:0;">
                        <label class="form-label">Ending Date</label>
                        <input type="text" class="form-input exp-end" value="${exp.end}" placeholder="e.g. Present">
                    </div>
                </div>
            `;
            row.querySelector('.exp-remove').addEventListener('click', () => row.remove());
            return row;
        };

        // Populate existing experiences
        if (Array.isArray(this.currentUser.experiences)) {
            this.currentUser.experiences.forEach(exp => {
                expContainer.appendChild(createExpRow(exp));
            });
        } else if (this.currentUser.experiences && typeof this.currentUser.experiences === 'string') {
            // Migrating old string data to one entry if it exist
            expContainer.appendChild(createExpRow({ position: 'Previous Experience', institution: 'N/A', start: '', end: '', legacy: this.currentUser.experiences }));
        }

        addExpBtn.addEventListener('click', () => {
            expContainer.appendChild(createExpRow());
        });

        container.querySelector('#profileForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            // Build publications arrays from rows or from quick plain editor
            const collectPubs = (root, type) => {
                const rows = Array.from(root.querySelectorAll('.pub-row.' + type));
                return rows.map(r => {
                    const year = r.querySelector(`input[name="${type}_year"]`).value.trim();
                    const text = r.querySelector(`input[name="${type}_text"]`).value.trim();
                    const link = r.querySelector(`input[name="${type}_link"]`).value.trim();
                    if (!year && !text) return null;
                    return { year: year || '', text: text || '', link: link || '' };
                }).filter(Boolean);
            };

            function parsePlain(text) {
                if (!text) return [];
                return text.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(line => {
                    // format: "YYYY - details | link"
                    const parts = line.split('|').map(s => s.trim());
                    const link = parts.length > 1 ? parts.pop() : '';
                    const left = parts.join(' | ');
                    const m = left.match(/^(\d{4})\s*[-–—:]?\s*(.*)$/);
                    if (m) return { year: m[1], text: m[2], link };
                    // fallback: try to extract leading year
                    const m2 = left.match(/^(\d{4})\b\s*(.*)$/);
                    if (m2) return { year: m2[1], text: m2[2], link };
                    return { year: '', text: left, link };
                });
            }

            let publications = { journal: [], conference: [] };
            try {
                const plainVisible = plainEditorEl && plainEditorEl.style.display !== 'none';
                const hasPlainContent = (journalPlainEl && journalPlainEl.value.trim()) || (conferencePlainEl && conferencePlainEl.value.trim());
                if (plainVisible && hasPlainContent) {
                    publications.journal = parsePlain(journalPlainEl.value.trim());
                    publications.conference = parsePlain(conferencePlainEl.value.trim());
                } else {
                    publications.journal = collectPubs(container, 'journal');
                    publications.conference = collectPubs(container, 'conference');
                }
            } catch (err) {
                publications = { journal: collectPubs(container, 'journal'), conference: collectPubs(container, 'conference') };
            }

            // Collect experiences
            const experiences = Array.from(expContainer.querySelectorAll('.exp-row')).map(row => ({
                position: row.querySelector('.exp-position').value.trim(),
                institution: row.querySelector('.exp-institution').value.trim(),
                start: row.querySelector('.exp-start').value.trim(),
                end: row.querySelector('.exp-end').value.trim()
            })).filter(exp => exp.position || exp.institution);

            this.updateProfile({
                name: formData.get('name'),
                designation: formData.get('designation'),
                department: formData.get('department'),
                education: formData.get('education'),
                research: formData.get('research'),
                photo: currentPhotoData,
                bio: formData.get('bio'),
                experiences,
                cv: currentCvData,
                publications
            });
        });
    }

    renderUsersPage(container) {
        if (this.currentUser.role !== 'admin') return;

        const rows = this.data.users.map(user => `
            <tr>
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <div class="user-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">
                            ${user.photo ? `<img src="${user.photo}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : user.name.charAt(0)}
                        </div>
                        <div>
                            <div style="font-weight: 500">${user.name}</div>
                            <div style="font-size: 0.75rem; color: var(--text-secondary)">${user.designation || 'N/A'}</div>
                        </div>
                    </div>
                </td>
                <td>${user.email}</td>
                <td><span class="tag tag-${user.role}">${user.role}</span></td>
                <td>${user.department}</td>
                <td style="text-align: right;">
                    ${user.id !== this.currentUser.id ?
                `<button class="btn btn-ghost delete-user-btn" data-id="${user.id}" style="padding: 0.4rem; color: var(--error-color);" title="Delete User">
                            <i class="ph ph-trash"></i>
                         </button>`
                : '<span style="color: var(--text-secondary); font-size: 0.8rem;">(Current)</span>'}
                </td>
            </tr>
        `).join('');

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h2 class="page-title">User Management</h2>
                    <p style="color: var(--text-secondary); margin-top: 0.25rem;">Manage system access and roles</p>
                </div>
                <button id="addUserBtn" class="btn btn-primary">
                    <i class="ph ph-plus"></i> Add New User
                </button>
            </div>
            <div class="glass-panel" style="overflow: hidden;">
                <div style="overflow-x: auto;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Department</th>
                                <th style="text-align: right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Attach event listener to "Add New User" button
        container.querySelector('#addUserBtn').addEventListener('click', () => {
            this.renderAddUserModal();
        });

        // Attach event listeners to "Delete User" buttons
        container.querySelectorAll('.delete-user-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.deleteUser(parseInt(btn.dataset.id));
            });
        });
    }

    renderAddUserModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content glass-panel">
                <button class="close-btn"><i class="ph ph-x"></i></button>
                <h2 style="margin-bottom: 1.5rem;">Add New User</h2>
                <form id="addUserForm">
                    <div class="form-group">
                        <label class="form-label">Full Name</label>
                        <input type="text" name="name" class="form-input" required placeholder="John Doe">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" name="email" class="form-input" required placeholder="email@ict.com">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                        <div class="form-group">
                            <label class="form-label">Role</label>
                            <select name="role" class="form-input" style="appearance: auto;">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Designation</label>
                            <input type="text" name="designation" class="form-input" placeholder="Lecturer">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Department</label>
                        <input type="text" name="department" class="form-input" placeholder="Computer Science">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Default Password</label>
                        <input type="text" name="password" class="form-input" value="user123" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%">Create User</button>
                </form>
            </div>
        `;

        // Close Logic
        const close = () => modal.remove();
        modal.querySelector('.close-btn').addEventListener('click', close);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) close();
        });

        // Submit Logic
        modal.querySelector('#addUserForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const newUser = {
                name: formData.get('name'),
                email: formData.get('email'),
                role: formData.get('role'),
                designation: formData.get('designation'),
                department: formData.get('department'),
                password: formData.get('password'),
                education: '',
                research: '',
                bio: '',
                photo: null
            };
            this.addUser(newUser);
            close();
        });

        document.body.appendChild(modal);
    }

    addUser(userData) {
        // Check availability
        if (this.data.users.find(u => u.email === userData.email)) {
            alert('User with this email already exists!');
            return;
        }

        const newId = this.data.users.length > 0 ? Math.max(...this.data.users.map(u => u.id)) + 1 : 1;
        const newUser = { ...userData, id: newId };

        this.data.users.push(newUser);
        this.saveData(this.data);

        // Refresh Current Page if on User Management
        this.renderUsersPage(document.getElementById('mainContent'));

        // Optional: Show success toast
        alert(`User ${newUser.name} created successfully!`);
    }

    updateProfile(updates) {
        // Update current user in session
        const updatedUser = { ...this.currentUser, ...updates };
        this.setSession(updatedUser);

        // Update in global mock DB
        const userIndex = this.data.users.findIndex(u => u.id === updatedUser.id);
        if (userIndex !== -1) {
            this.data.users[userIndex] = updatedUser;
            this.saveData(this.data);
        }

        // Show Success Message
        const msg = document.getElementById('saveMessage');
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 2000);

        // Update mini profile sidebar
        this.renderDashboard(); // Re-render to update sidebar info, but navigates back to profile default. A bit jarring but functional for POC.
        // Ideally we just update the DOM elements, but for simplicity re-render is fine.
        // Actually re-rendering resets internal state. Let's just manually update navigation to stay on profile.
        // Due to the re-render logic in renderDashboard calling navigate('profile'), it works out.
    }

    handleLogin(email, password) {
        const user = this.data.users.find(u => u.email === email && u.password === password);
        if (user) {
            this.setSession(user);
        } else {
            const errorMsg = document.getElementById('loginError');
            errorMsg.classList.remove('hidden');
        }
    }
}

// Initialize App
new App();
