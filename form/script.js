document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('multistepForm');
    const steps = form.querySelectorAll('.step');
    const progressBar = document.querySelector('.progress');
    let currentStep = 0;

    const states = [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
        'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
        'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
        'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
        'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
    ];

    function createWeightLossChart(currentWeight, targetWeight) {
        const ctx = document.getElementById('weightLossChart').getContext('2d');
        const labels = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
        const data = [
            currentWeight,
            currentWeight - (currentWeight - targetWeight) * 0.2,
            currentWeight - (currentWeight - targetWeight) * 0.4,
            currentWeight - (currentWeight - targetWeight) * 0.6,
            currentWeight - (currentWeight - targetWeight) * 0.8,
            targetWeight
        ];

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    fill: true,
                    backgroundColor: 'rgba(27, 35, 83, 0.2)',
                    borderColor: 'rgba(27, 35, 83, 1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: Math.min(...data) - 10,
                        suggestedMax: Math.max(...data) + 10
                    }
                }
            }
        });
    }

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.style.display = index === stepIndex ? 'block' : 'none';
        });
        progressBar.style.width = `${((stepIndex + 1) / steps.length) * 100}%`;

        if (stepIndex === steps.length - 1) {
            populateRecap();
            calculateWeightLoss();
        }
    }

    function validateStep(stepIndex) {
        const currentStepElement = steps[stepIndex];
        const inputs = currentStepElement.querySelectorAll('input, select');
        let isValid = true;

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value) {
                isValid = false;
                input.classList.add('error');
            } else {
                input.classList.remove('error');
            }
        });

        return isValid;
    }

    function nextStep() {
        if (validateStep(currentStep)) {
            currentStep++;
            if (currentStep < steps.length) {
                showStep(currentStep);
            }
        }
    }

    function previousStep() {
        if (currentStep > 0) {
            currentStep--;
            showStep(currentStep);
        }
    }

    function setupDateInput() {
        const dobInput = document.getElementById('dob');
        if (dobInput) {
            flatpickr(dobInput, {
                dateFormat: "Y-m-d",
                maxDate: "today",
                defaultDate: "1990-01-01",
                altInput: true,
                altFormat: "F j, Y",
                theme: "material_blue",
                disableMobile: true,
                onChange: function(selectedDates, dateStr, instance) {
                    const birthDate = selectedDates[0];
                    const age = calculateAge(birthDate);
                    const ageDisplay = document.getElementById('age-display');
                    if (ageDisplay) {
                        ageDisplay.textContent = `Age: ${age}`;
                    }
                }
            });
        }
    }

    function calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    function setupNavigation() {
        const backButtons = form.querySelectorAll('.back-btn');
        const continueButtons = form.querySelectorAll('.continue-btn');
        const submitButton = form.querySelector('.submit-btn');

        backButtons.forEach(button => {
            button.addEventListener('click', previousStep);
        });

        continueButtons.forEach(button => {
            button.addEventListener('click', nextStep);
        });

        submitButton.addEventListener('click', submitForm);
    }

    function populateRecap() {
        const nameRecap = document.getElementById('nameRecap');
        const stateRecap = document.getElementById('stateRecap');
        const emailRecap = document.getElementById('emailRecap');
        const goalsList = document.getElementById('goalsList');
        const heightRecap = document.getElementById('heightRecap');
        const weightRecap = document.getElementById('weightRecap');
        const ageRecap = document.getElementById('ageRecap');
        const sexRecap = document.getElementById('sexRecap');

        // Populate name, state, and email
        nameRecap.textContent = document.getElementById('name').value;
        stateRecap.textContent = document.getElementById('state').value;
        emailRecap.textContent = document.getElementById('email').value;

        // Populate goals
        goalsList.innerHTML = '';
        const goals = document.querySelectorAll('input[name="goal"]:checked');
        goals.forEach(goal => {
            const li = document.createElement('li');
            li.textContent = goal.parentElement.textContent.trim();
            goalsList.appendChild(li);
        });

        // Populate height
        const feet = document.getElementById('feet').value;
        const inches = document.getElementById('inches').value;
        heightRecap.textContent = `${feet}' ${inches}"`;

        // Populate weight
        weightRecap.textContent = document.getElementById('weight').value;

        // Populate age
        const dob = new Date(document.getElementById('dob').value);
        ageRecap.textContent = calculateAge(dob);

        // Populate sex
        sexRecap.textContent = document.getElementById('sex').value;
    }

    function calculateWeightLoss() {
        const weight = parseFloat(document.getElementById('weight').value);
        const feet = parseFloat(document.getElementById('feet').value);
        const inches = parseFloat(document.getElementById('inches').value);
        const heightInInches = feet * 12 + inches;
        const sex = document.getElementById('sex').value;

        const bmi = calculateBMI(weight, heightInInches);
        const targetBMI = 24.9; // Upper limit of normal BMI range
        const targetWeight = Math.round((targetBMI * heightInInches * heightInInches) / 703);
        const weightLoss = Math.max(0, weight - targetWeight);

        document.getElementById('totalWeightDisplay').textContent = weight + ' lbs';
        document.getElementById('potentialLossDisplay').textContent = weightLoss + ' lbs';

        createWeightLossChart(weight, targetWeight);
        updateBMIDisplay(bmi);
    }

    function calculateBMI(weight, heightInInches) {
        return ((weight / (heightInInches * heightInInches)) * 703).toFixed(1);
    }

    function updateBMIDisplay(bmi) {
        const bmiValue = document.getElementById('bmiValue');
        const bmiCategory = document.getElementById('bmiCategory');
        const bmiGauge = document.querySelector('.bmi-gauge');

        if (bmiValue) bmiValue.textContent = bmi;

        let category, color, percentage;
        if (bmi < 18.5) {
            category = 'Underweight';
            color = '#64B5F6';
            percentage = (bmi / 18.5) * 25;
        } else if (bmi < 25It seems the JavaScript file cut off before completion. Here's the corrected and integrated version that ensures all form data is sent to the MD Integrations API:

### **JavaScript (script.js) - Final Part**

```javascript
    async function sendDataToAPI(data) {
        const apiUrl = 'https://api.mdintegrations.com/v1/partner/patients'; // Replace with your actual API endpoint
        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer YOUR_ACCESS_TOKEN', // Replace with your API token
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Success:', result);
            alert('Form submitted successfully!');
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error submitting the form. Please try again.');
        }
    }

    function submitForm(e) {
        e.preventDefault();
        if (validateStep(currentStep)) {
            const formData = collectFormData();
            console.log('Form data:', formData);
            sendDataToAPI(formData);
        }
    }

    function populateStateSelector() {
        const stateSelector = document.getElementById('state');
        states.forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateSelector.appendChild(option);
        });
    }

    // Initialize the form
    showStep(currentStep);
    setupNavigation();
    setupDateInput();
    setupNameEmailInputs();
    populateStateSelector();
});
