// Current state
let pendingPatientName = null;
let pendingUploadPatientId = null;
let currentMode = null; // 'medical_report' or 'medical_knowledge'
let lastPatientId = null; // Track last patient discussed for context
let lastPatientName = null; // Track last patient name for context

// Initialize on load
window.addEventListener('load', () => {
    setupEventListeners();
    
    // Check backend health
    api.get('/health').then(data => {
        console.log('✅ Backend healthy:', data);
    }).catch(err => {
        console.error('❌ Backend connection failed:', err);
        addBotMessage('⚠️ Cannot connect to backend. Make sure server is running.');
    });
});

function setupEventListeners() {
    // Mode bubbles
    document.querySelectorAll('.mode-bubble').forEach(bubble => {
        bubble.addEventListener('click', () => {
            const mode = bubble.dataset.mode;
            selectMode(mode);
        });
    });

    // Send button
    document.getElementById('sendButton').addEventListener('click', handleSendMessage);

    // Enter key in input
    document.getElementById('chatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
            handleSendMessage();
        }
    });
}

function selectMode(mode) {
    const chatInput = document.getElementById('chatInput');
    const modeButton = document.querySelector(`[data-mode="${mode}"]`);
    const isCurrentlyActive = modeButton && modeButton.classList.contains('active');
    
    // Toggle: If already active, deactivate it
    if (isCurrentlyActive) {
        currentMode = null;
        modeButton.classList.remove('active');
        chatInput.placeholder = 'Ask me anything about patients, reports, tasks...';
        addBotMessage('**Medical Knowledge Mode Deactivated** 📚\n\nYou can now ask about patient reports, tasks, or any other queries.');
    } else {
        // Activate the mode
        currentMode = mode;
        
        // Update active state
        document.querySelectorAll('.mode-bubble').forEach(bubble => {
            bubble.classList.remove('active');
        });
        modeButton.classList.add('active');
        
        // Update input placeholder
        if (mode === 'medical_report') {
            chatInput.placeholder = 'Ask about patient reports, summaries, prescriptions...';
            addBotMessage('**Medical Report Mode Activated** 📊\n\nI can help you with:\n• Finding specific patient reports\n• Summarizing medical reports\n• Suggesting prescriptions based on reports\n• Analyzing report data\n\nExample: "Do you have Rajesh medical report?" or "Summarize John Doe\'s latest report"');
        } else if (mode === 'medical_knowledge') {
            chatInput.placeholder = 'Ask about medical knowledge, latest news, articles...';
            addBotMessage('**Medical Knowledge Mode Activated** 📚\n\nI can help you with:\n• Medical information and guidelines\n• Latest medical news and articles\n• Research papers and studies\n• Treatment protocols\n• Any medical questions\n\nAsk me anything about medicine!');
        }
    }
    
    // Focus input
    chatInput.focus();
}

function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user-message';
    messageDiv.innerHTML = `
        <div class="message-avatar">👤</div>
        <div class="message-content">
            <p>${escapeHtml(text)}</p>
            </div>
    `;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(content) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    
    const formattedContent = formatMessage(content);
    
    messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            ${formattedContent}
                            </div>
                        `;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function addLoadingMessage() {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot-message';
    messageDiv.id = 'loadingMessage';
    messageDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="loading-indicator">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                                </div>
                            </div>
    `;
    messagesContainer.appendChild(messageDiv);
    scrollToBottom();
}

function removeLoadingMessage() {
    const loadingMsg = document.getElementById('loadingMessage');
    if (loadingMsg) {
        loadingMsg.remove();
    }
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatMessage(content) {
    // Split by lines to handle lists properly
    const lines = content.split('\n');
    let formatted = '';
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        // Check if line is a bullet point
        if (line.startsWith('• ') || line.startsWith('- ')) {
            if (!inList) {
                formatted += '<ul>';
                inList = true;
            }
            const listItem = line.substring(2);
            formatted += `<li>${formatInlineMarkdown(listItem)}</li>`;
        } else {
            if (inList) {
                formatted += '</ul>';
                inList = false;
            }
            if (line) {
                formatted += `<p>${formatInlineMarkdown(line)}</p>`;
        } else {
                formatted += '<br>';
            }
        }
    }
    
    if (inList) {
        formatted += '</ul>';
    }
    
    return formatted || formatInlineMarkdown(content);
}

function formatInlineMarkdown(text) {
    // Escape HTML first
    let formatted = escapeHtml(text);
    
    // Convert **text** to <strong>text</strong>
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *text* to <em>text</em> (but not if it's part of **)
    formatted = formatted.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
    
    return formatted;
}

function addDragDropUpload(patientName, patientId) {
    const messagesContainer = document.getElementById('chatMessages');
    const uploadDiv = document.createElement('div');
    uploadDiv.className = 'message bot-message';
    uploadDiv.id = 'uploadMessage';
    uploadDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p>I couldn't find a medical report for <strong>${escapeHtml(patientName)}</strong> in the database.</p>
            <p>Please upload their medical report file:</p>
            <div class="drag-drop-zone" id="dragDropZone">
                <div class="drag-drop-content">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p><strong>Drag and drop</strong> file(s) here, or <strong>click to browse</strong></p>
                    <p class="file-hint">PDF, JPG, PNG files accepted (Multiple files supported)</p>
                </div>
                <input type="file" id="dragDropFileInput" accept=".pdf,.jpg,.jpeg,.png" multiple style="display: none;">
                </div>
            <div id="uploadFileInfo" class="file-info" style="margin-top: 0.5rem;"></div>
                </div>
    `;
    messagesContainer.appendChild(uploadDiv);
    
    // Setup drag and drop
    const dropZone = document.getElementById('dragDropZone');
    const fileInput = document.getElementById('dragDropFileInput');
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            if (files.length === 1) {
                handleFileUpload(files[0], patientName, patientId);
            } else {
                handleMultipleFileUpload(Array.from(files));
            }
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            if (e.target.files.length === 1) {
                handleFileUpload(e.target.files[0], patientName, patientId);
            } else {
                handleMultipleFileUpload(Array.from(e.target.files));
            }
        }
    });
    
    scrollToBottom();
}

function addGenericUploadSection() {
    const messagesContainer = document.getElementById('chatMessages');
    const uploadDiv = document.createElement('div');
    uploadDiv.className = 'message bot-message';
    uploadDiv.id = 'uploadMessage';
    uploadDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p>Please upload medical report file(s):</p>
            <div class="drag-drop-zone" id="dragDropZone">
                <div class="drag-drop-content">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <p><strong>Drag and drop</strong> file(s) here, or <strong>click to browse</strong></p>
                    <p class="file-hint">PDF, JPG, PNG files accepted (Multiple files supported)</p>
                </div>
                <input type="file" id="dragDropFileInput" accept=".pdf,.jpg,.jpeg,.png" multiple style="display: none;">
            </div>
            <div id="uploadFileInfo" class="file-info" style="margin-top: 0.5rem;"></div>
        </div>
    `;
    messagesContainer.appendChild(uploadDiv);
    
    // Setup drag and drop
    const dropZone = document.getElementById('dragDropZone');
    const fileInput = document.getElementById('dragDropFileInput');
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            if (files.length === 1) {
                handleFileUpload(files[0], null, null);
            } else {
                handleMultipleFileUpload(Array.from(files));
            }
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            if (e.target.files.length === 1) {
                handleFileUpload(e.target.files[0], null, null);
            } else {
                handleMultipleFileUpload(Array.from(e.target.files));
            }
        }
    });
    
    scrollToBottom();
}

function removeUploadMessage() {
    const uploadMsg = document.getElementById('uploadMessage');
    if (uploadMsg) {
        uploadMsg.remove();
    }
}

async function handleSendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;

    // Add user message
    addUserMessage(message);
    input.value = '';
    
    // Show loading
    addLoadingMessage();

    try {
        await handleQuery(message);
    } catch (error) {
        console.error('Error in handleSendMessage:', error);
        removeLoadingMessage();
        addBotMessage(`❌ Error: ${error.message || 'An unexpected error occurred'}`);
    }
}

async function handleQuery(message) {
    // Mode selection is now optional - queries work without it
    // If no mode is selected, check if Medical Knowledge button is active, otherwise default to medical_report mode
    if (!currentMode) {
        // Check if Medical Knowledge button is active
        const medicalKnowledgeBtn = document.querySelector('[data-mode="medical_knowledge"]');
        if (medicalKnowledgeBtn && medicalKnowledgeBtn.classList.contains('active')) {
            currentMode = "medical_knowledge";
        } else {
            currentMode = "medical_report";
        }
    }
    
    removeLoadingMessage();
    addLoadingMessage();
    
    try {
        console.log('Sending query to backend:', message, 'Mode:', currentMode);
        
        // Send query to OpenAI-powered endpoint with mode and context
        const response = await api.post('/api/doctor/chat/query', { 
            query: message,
            mode: currentMode,
            last_patient_id: lastPatientId,
            last_patient_name: lastPatientName
        });
        
        console.log('Response received:', response);
        
        removeLoadingMessage();
        
        // Store last patient context if provided
        if (response.last_patient_id) {
            lastPatientId = response.last_patient_id;
            lastPatientName = response.last_patient_name || response.patient_name;
        } else if (response.patient_id) {
            lastPatientId = response.patient_id;
            lastPatientName = response.patient_name;
        }
        
        // Display the response
        addBotMessage(response.response);
        
        // Handle report cards display
        if (response.action === "show_report_cards" && response.reports) {
            addReportCards(response.reports);
        }
        
        // Handle task cards display
        if (response.action === "show_task_cards" && response.tasks) {
            addTaskCards(response.tasks);
        }
        
        // Handle cleanup response
        if (response.action === "cleanup_complete") {
            addBotMessage(`✅ **Cleanup Complete**\n\nDeleted ${response.deleted_count || 0} invalid report(s) from the database.`);
        }
        
        // Handle task-related responses
        if (response.action === "show_task_filter_options" || response.show_task_options) {
            addTaskFilterOptions();
        }
        
        if (response.action === "create_task_prompt" || response.action === "show_create_task_form" || response.show_create_task) {
            const suggestedTaskName = response.suggested_task_name || '';
            addTaskCreationForm(suggestedTaskName);
        }
        
        // If upload is required, show drag-and-drop
        if (response.requires_upload) {
            const patientName = response.patient_name || 'Unknown Patient';
            const patientId = response.patient_id || null;
            // If no specific patient, show generic upload message
            if (!response.patient_name) {
                addGenericUploadSection();
            } else {
                addDragDropUpload(patientName, patientId);
            }
        }
        
    } catch (error) {
        console.error('Error in handleQuery:', error);
        removeLoadingMessage();
        const errorMsg = error.message || error.toString() || 'Unknown error occurred';
        addBotMessage(`❌ Error: ${errorMsg}\n\nPlease check your internet connection and try again. If the problem persists, the server may be temporarily unavailable.`);
    }
}

async function handleFileUpload(file, patientName, patientId) {
    removeUploadMessage();
    addLoadingMessage();
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('patient_id', patientId || 1);
        formData.append('report_type', 'lab');
        formData.append('report_name', file.name.replace(/\.[^/.]+$/, ''));

        const response = await api.uploadFile('/api/doctor/reports/upload', formData);
        removeLoadingMessage();
        
        // Check if this is a duplicate
        if (response.duplicate) {
            showDuplicateMessage(response, file, patientName, patientId);
        } else {
            const extractedPatientName = response.patient_name || patientName || 'Unknown';
            addBotMessage(`✅ **Report uploaded successfully**\n\n**Patient:** ${extractedPatientName}\n**Report ID:** ${response.report_id}\n**Filename:** ${file.name}\n\nThe report has been saved to the database. You can now ask me about this patient's reports.`);
        }
    } catch (error) {
        removeLoadingMessage();
        addBotMessage(`❌ Error uploading report: ${error.message}`);
    }
}

function showDuplicateMessage(duplicateInfo, file, patientName, patientId) {
    const messagesContainer = document.getElementById('chatMessages');
    const duplicateDiv = document.createElement('div');
    duplicateDiv.className = 'message bot-message';
    duplicateDiv.id = 'duplicateMessage';
    duplicateDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <p><strong>⚠️ ${duplicateInfo.message}</strong></p>
            <p><strong>Existing Report Details:</strong></p>
            <p>• Patient: ${escapeHtml(duplicateInfo.existing_patient_name)}</p>
            <p>• Report Date: ${escapeHtml(duplicateInfo.existing_report_date)}</p>
            <p>• Filename: ${escapeHtml(duplicateInfo.filename)}</p>
            <p style="margin-top: 1rem;"><strong>Is this an updated medical report?</strong></p>
            <div class="duplicate-actions" style="margin-top: 1rem; display: flex; gap: 1rem;">
                <button class="duplicate-yes-btn" style="padding: 0.5rem 1.5rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    ✅ Yes, Upload as Updated Report
                </button>
                <button class="duplicate-no-btn" style="padding: 0.5rem 1.5rem; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold;">
                    ❌ No, Cancel Upload
                </button>
            </div>
        </div>
    `;
    messagesContainer.appendChild(duplicateDiv);
    scrollToBottom();
    
    // Store duplicate info for button handlers
    duplicateDiv.dataset.fileHash = duplicateInfo.file_hash;
    duplicateDiv.dataset.filename = duplicateInfo.filename;
    duplicateDiv.dataset.patientName = patientName || '';
    duplicateDiv.dataset.patientId = patientId || '';
    
    // Add event listeners
    duplicateDiv.querySelector('.duplicate-yes-btn').addEventListener('click', async () => {
        await handleDuplicateConfirm(duplicateDiv, true, file, patientName, patientId);
    });
    
    duplicateDiv.querySelector('.duplicate-no-btn').addEventListener('click', async () => {
        await handleDuplicateConfirm(duplicateDiv, false, file, patientName, patientId);
    });
}

async function handleDuplicateConfirm(duplicateDiv, confirm, file, patientName, patientId) {
    const duplicateMsg = document.getElementById('duplicateMessage');
    if (duplicateMsg) {
        duplicateMsg.remove();
    }
    
    if (confirm) {
        // User clicked Yes - upload as updated report
        addLoadingMessage();
        try {
            const fileHash = duplicateDiv.dataset.fileHash;
            const filename = duplicateDiv.dataset.filename || file.name;
            const patientId = duplicateDiv.dataset.patientId || null;
            
            const response = await api.post('/api/doctor/reports/upload-confirm', {
                file_hash: fileHash,
                filename: filename,
                patient_id: patientId ? parseInt(patientId) : null,
                report_type: 'lab',
                report_name: filename.replace(/\.[^/.]+$/, '')
            });
            
            removeLoadingMessage();
            const extractedPatientName = response.patient_name || patientName || 'Unknown';
            addBotMessage(`✅ **Report uploaded successfully as updated version**\n\n**Patient:** ${extractedPatientName}\n**Report ID:** ${response.report_id}\n**Filename:** ${filename}\n\nThe updated report has been saved to the database.`);
        } catch (error) {
            removeLoadingMessage();
            // Handle error response properly
            let errorMessage = 'Unknown error occurred';
            if (error.message) {
                errorMessage = error.message;
            } else if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    errorMessage = error.response.data;
                } else if (error.response.data.detail) {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            }
            addBotMessage(`❌ Error uploading updated report: ${errorMessage}`);
        }
    } else {
        // User clicked No - cancel upload
        addBotMessage(`❌ **Upload cancelled**\n\nThe duplicate report was not uploaded.`);
    }
}

async function handleMultipleFileUpload(files) {
    removeUploadMessage();
    addLoadingMessage();
    
    try {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await api.uploadFile('/api/doctor/reports/upload-multiple', formData);
        removeLoadingMessage();
        
        let message = `✅ **${response.uploaded_count} report(s) uploaded successfully**\n\n`;
        
        if (response.reports && response.reports.length > 0) {
            message += "**Uploaded Reports:**\n";
            response.reports.forEach((report, index) => {
                message += `${index + 1}. ${report.filename} - Patient: ${report.patient_name}\n`;
            });
        }
        
        if (response.errors && response.errors.length > 0) {
            message += `\n**Errors:**\n${response.errors.join('\n')}`;
        }
        
        message += "\n\nAll reports have been saved to the database. You can now ask me about these patients.";
        
        addBotMessage(message);
    } catch (error) {
        removeLoadingMessage();
        addBotMessage(`❌ Error uploading reports: ${error.message}`);
    }
}

// Task Management Functions
function addTaskFilterOptions() {
    const messagesContainer = document.getElementById('chatMessages');
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'message bot-message';
    optionsDiv.id = 'taskFilterOptions';
    optionsDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <div class="task-options">
                <button class="task-option-btn" data-status="pending">📋 Pending Tasks</button>
                <button class="task-option-btn" data-status="completed">✅ Completed Tasks</button>
                <button class="task-option-btn" data-status="all">📊 All Tasks</button>
            </div>
        </div>
    `;
    messagesContainer.appendChild(optionsDiv);
    scrollToBottom();
    
    // Add event listeners
    document.querySelectorAll('.task-option-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const status = btn.dataset.status;
            await handleTaskFilter(status);
        });
    });
}

async function handleTaskFilter(status) {
    try {
        addLoadingMessage();
        
        let url = '/api/doctor/tasks';
        if (status !== 'all') {
            url += `?status=${status}`;
        }
        
        const response = await api.get(url);
        removeLoadingMessage();
        
        if (response.tasks && response.tasks.length > 0) {
            const statusLabel = status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1);
            let responseText = `**${statusLabel} Tasks (${response.count}):**\n\nClick on any task card below to view full details.\n\n`;
            
            addBotMessage(responseText);
            
            // Convert tasks to card format and display
            const tasksData = response.tasks.map(task => ({
                id: task.id,
                title: task.title,
                description: task.description || "No description",
                status: task.status,
                priority: task.priority,
                task_type: task.task_type || "N/A",
                due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : null,
                created_at: task.created_at ? new Date(task.created_at).toISOString().split('T')[0] : null,
                completed_at: task.completed_at ? new Date(task.completed_at).toISOString().replace('T', ' ').substring(0, 16) : null
            }));
            
            addTaskCards(tasksData);
        } else {
            addBotMessage(`**No ${status === 'all' ? '' : status + ' '}tasks found.**`);
        }
        
        // Remove the options
        const optionsDiv = document.getElementById('taskFilterOptions');
        if (optionsDiv) {
            optionsDiv.remove();
        }
    } catch (error) {
        removeLoadingMessage();
        addBotMessage(`❌ Error fetching tasks: ${error.message}`);
    }
}

function addTaskCreationForm(suggestedTaskName = '') {
    const messagesContainer = document.getElementById('chatMessages');
    const formDiv = document.createElement('div');
    formDiv.className = 'message bot-message';
    formDiv.id = 'taskCreationForm';
    formDiv.innerHTML = `
        <div class="message-avatar">🤖</div>
        <div class="message-content">
            <form id="createTaskForm" class="task-form">
                <div class="form-group">
                    <label for="taskTitle">Task Title *</label>
                    <input type="text" id="taskTitle" name="title" required value="${escapeHtml(suggestedTaskName)}" placeholder="e.g., Check patient follow-up">
                </div>
                <div class="form-group">
                    <label for="taskDescription">Description</label>
                    <textarea id="taskDescription" name="description" rows="3" placeholder="Describe the task..."></textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="taskType">Task Type</label>
                        <select id="taskType" name="task_type">
                            <option value="follow_up">Follow Up</option>
                            <option value="prescription_refill">Prescription Refill</option>
                            <option value="test_review">Test Review</option>
                            <option value="general">General</option>
            </select>
        </div>
                    <div class="form-group">
                        <label for="taskPriority">Priority</label>
                        <select id="taskPriority" name="priority">
                            <option value="low">Low</option>
                            <option value="medium" selected>Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="taskDueDate">Due Date (Optional)</label>
                    <input type="date" id="taskDueDate" name="due_date">
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn-primary">Create Task</button>
                    <button type="button" class="btn-secondary" onclick="document.getElementById('taskCreationForm').remove()">Cancel</button>
                </div>
            </form>
        </div>
    `;
    messagesContainer.appendChild(formDiv);
    scrollToBottom();
    
    // Add form submit handler
    document.getElementById('createTaskForm').addEventListener('submit', handleCreateTask);
}

async function handleCreateTask(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description') || '',
        task_type: formData.get('task_type'),
        priority: formData.get('priority'),
        due_date: formData.get('due_date') || null
    };
    
    try {
        addLoadingMessage();
        const response = await api.post('/api/doctor/tasks', taskData);
        removeLoadingMessage();
        
        addBotMessage(`✅ **Task created successfully!**\n\n**${response.task.title}**\n• Status: ${response.task.status}\n• Priority: ${response.task.priority}\n• Type: ${response.task.task_type}`);
        
        // Remove the form
        const formDiv = document.getElementById('taskCreationForm');
        if (formDiv) {
            formDiv.remove();
        }
        
        // Clear input
        document.getElementById('chatInput').value = '';
    } catch (error) {
        removeLoadingMessage();
        addBotMessage(`❌ Error creating task: ${error.message}`);
    }
}

function addReportCards(reports) {
    const messagesContainer = document.getElementById('chatMessages');
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'report-cards-container';
    cardsContainer.id = 'reportCardsContainer';
    
    let cardsHTML = '<div class="report-cards-grid">';
    
    reports.forEach((report, index) => {
        cardsHTML += `
            <div class="report-card" data-report-id="${report.id}" onclick="viewReportDetails(${report.id})">
                <div class="report-card-header">
                    <h3 class="report-card-title">${escapeHtml(report.report_name)}</h3>
                </div>
                <div class="report-card-body">
                    <p class="report-card-patient"><strong>Patient:</strong> ${escapeHtml(report.patient_name)}</p>
                    <p class="report-card-type"><strong>Type:</strong> ${escapeHtml(report.report_type)}</p>
                    <p class="report-card-date"><strong>Date:</strong> ${escapeHtml(report.report_date)}</p>
                </div>
                <div class="report-card-footer">
                    <span class="report-card-click-hint">Click to view details</span>
                </div>
            </div>
        `;
    });
    
    cardsHTML += '</div>';
    cardsContainer.innerHTML = cardsHTML;
    messagesContainer.appendChild(cardsContainer);
    scrollToBottom();
}

async function viewReportDetails(reportId) {
    try {
        // Get the base URL from the API instance
        const baseURL = api.baseURL || '';
        const fileUrl = `${baseURL}/api/doctor/reports/${reportId}/file`;
        
        // Open the original file in a new tab
        window.open(fileUrl, '_blank');
    } catch (error) {
        addBotMessage(`❌ Error opening report file: ${error.message}`);
    }
}

// Make viewReportDetails available globally
window.viewReportDetails = viewReportDetails;

function addTaskCards(tasks) {
    const messagesContainer = document.getElementById('chatMessages');
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'task-cards-container';
    cardsContainer.id = 'taskCardsContainer';
    
    let cardsHTML = '<div class="task-cards-grid">';
    
    tasks.forEach((task, index) => {
        const statusIcon = task.status === 'completed' ? '✅' : task.status === 'in_progress' ? '🔄' : '📋';
        const priorityColor = task.priority === 'high' ? '#ff4444' : task.priority === 'medium' ? '#ffaa00' : '#44ff44';
        
        cardsHTML += `
            <div class="task-card" data-task-id="${task.id}" onclick="viewTaskDetails(${task.id})">
                <div class="task-card-header">
                    <h3 class="task-card-title">${escapeHtml(task.title)}</h3>
                    <span class="task-card-status">${statusIcon} ${escapeHtml(task.status)}</span>
                </div>
                <div class="task-card-body">
                    <p class="task-card-description">${escapeHtml(task.description.substring(0, 100))}${task.description.length > 100 ? '...' : ''}</p>
                    <div class="task-card-meta">
                        <span class="task-card-priority" style="color: ${priorityColor}">
                            <strong>Priority:</strong> ${escapeHtml(task.priority)}
                        </span>
                        ${task.due_date ? `<span class="task-card-due-date"><strong>Due:</strong> ${escapeHtml(task.due_date)}</span>` : ''}
                    </div>
                </div>
                <div class="task-card-footer">
                    <span class="task-card-click-hint">Click to view details</span>
                </div>
            </div>
        `;
    });
    
    cardsHTML += '</div>';
    cardsContainer.innerHTML = cardsHTML;
    messagesContainer.appendChild(cardsContainer);
    scrollToBottom();
}

async function viewTaskDetails(taskId) {
    try {
        addLoadingMessage();
        const response = await api.get(`/api/doctor/tasks/${taskId}`);
        removeLoadingMessage();
        
        let detailsText = `**📋 Full Task Details**\n\n`;
        detailsText += `**Title:** ${response.title || 'N/A'}\n`;
        detailsText += `**Status:** ${response.status || 'N/A'}\n`;
        detailsText += `**Priority:** ${response.priority || 'N/A'}\n`;
        detailsText += `**Type:** ${response.task_type || 'N/A'}\n\n`;
        
        if (response.description) {
            detailsText += `**Description:**\n${response.description}\n\n`;
        }
        
        detailsText += `---\n\n`;
        
        if (response.due_date) {
            detailsText += `**Due Date:** ${response.due_date}\n`;
        }
        if (response.created_at) {
            detailsText += `**Created At:** ${response.created_at}\n`;
        }
        if (response.completed_at) {
            detailsText += `**Completed At:** ${response.completed_at}\n`;
        }
        
        addBotMessage(detailsText);
    } catch (error) {
        removeLoadingMessage();
        addBotMessage(`❌ Error loading task details: ${error.message}`);
    }
}

// Make viewTaskDetails available globally
window.viewTaskDetails = viewTaskDetails;
