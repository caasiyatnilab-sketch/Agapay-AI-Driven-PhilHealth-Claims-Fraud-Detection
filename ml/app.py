import os
import random
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib

app = Flask(__name__)
CORS(app)

MODEL_PATH = 'philhealth_fraud_model.pkl'

def train_dummy_model():
    print("Training initial dummy Isolation Forest model...")
    # Simulated historical data: 
    # [age, amount, days_admitted, case_type, hosp_type, region, prev_claims]
    np.random.seed(42)
    # Generate normal claims
    normal = np.random.normal(loc=[40, 15000, 3, 1, 1, 1, 0], scale=[15, 5000, 2, 0.5, 0.5, 0.5, 0.5], size=(500, 7))
    # Generate anomalies (e.g. huge amount, short stay)
    anomalies = np.random.normal(loc=[40, 150000, 1, 1, 1, 1, 5], scale=[10, 20000, 0.5, 0.5, 0.5, 0.5, 2], size=(25, 7))
    
    X = np.vstack([normal, anomalies])
    X = np.abs(X) # no negative values
    
    model = IsolationForest(contamination=0.05, random_state=42)
    model.fit(X)
    joblib.dump(model, MODEL_PATH)

if not os.path.exists(MODEL_PATH):
    train_dummy_model()

model = joblib.load(MODEL_PATH)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        features = np.array([[
            data.get('patient_age', 30),
            data.get('amount_claimed', 10000),
            data.get('days_admitted', 3),
            data.get('case_rate_type_encoded', 1),
            data.get('hospital_type', 1),
            data.get('region_encoded', 1),
            data.get('previous_claims_count', 0)
        ]])
        
        score = model.decision_function(features)[0]
        # normalize score roughly between 0 and 1 (1 = max risk, meaning highly negative decision function)
        # IsolationForest decision function: negative means outlier.
        # Let's map it: lowest score (most anomalous) maps to high risk (~1.0).
        risk_score = float(1 / (1 + np.exp(score * 5))) 
        
        return jsonify({
            'risk_score': risk_score,
            'is_anomalous': bool(model.predict(features)[0] == -1),
            'raw_score': float(score)
        })
    except Exception as e:
         return jsonify({'error': str(e)}), 400

@app.route('/extract', methods=['POST'])
def extract():
    # Simulates Tesseract OCR for a claim form document
    templates = [
        "PHILHEALTH CLAIM FORM 1\nPatient: Dela Cruz, Juan\nDiagnosis: Dengue Hemorrhagic Fever\nTotal: PHP 10,000",
        "MEDICAL ABSTRACT\nPatient admitted with severe pneumonia. Stay length: 5 days. Attending: Dr. Rizal.",
        "ACCREDITED FACILITY RECEIPT\nAmount due: PHP 24,000. Procedure: Appendectomy."
    ]
    return jsonify({
        "extracted_text": random.choice(templates),
        "confidence": 0.92
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
