# Core Statistics and Probability for Data Science

Statistics and probability form the bedrock of data science, enabling practitioners to understand data, make informed decisions, and build robust models. This guide covers the essential concepts you need to master.

## 1. Descriptive Statistics

Descriptive statistics summarize and organize characteristics of a data set.

### Measures of Central Tendency

These describe the center point of a dataset.
*   **Mean:** The average of all values. Sensitive to outliers.
*   **Median:** The middle value when data is ordered. Robust to outliers.
*   **Mode:** The most frequently occurring value(s). Useful for categorical data.

### Measures of Dispersion (Spread)

These describe how spread out the data points are.
*   **Range:** The difference between the maximum and minimum values.
*   **Variance:** The average of the squared differences from the Mean.
*   **Standard Deviation:** The square root of the variance. Provides a measure of spread in the same units as the data.
*   **Interquartile Range (IQR):** The range between the 75th percentile (Q3) and the 25th percentile (Q1). Robust to outliers.

### Python Example: Descriptive Statistics

```python
import numpy as np
import pandas as pd

data = [12, 15, 13, 18, 16, 14, 17, 20, 19, 11]

# Using NumPy for basic stats
mean_val = np.mean(data)
median_val = np.median(data)
std_dev = np.std(data)
variance = np.var(data)

# Using Pandas Series for more comprehensive stats
s = pd.Series(data)
description = s.describe()

print(f"Mean: {mean_val}")
print(f"Median: {median_val}")
print(f"Standard Deviation: {std_dev}")
print(f"Variance: {variance}")
print("\nPandas Describe:\n", description)

# IQR calculation
Q1 = np.percentile(data, 25)
Q3 = np.percentile(data, 75)
iqr_val = Q3 - Q1
print(f"IQR: {iqr_val}")
```

## 2. Probability Theory

Probability quantifies the likelihood of an event occurring.

### Core Concepts

*   **Sample Space (S):** The set of all possible outcomes of an experiment.
*   **Event (E):** A subset of the sample space.
*   **Probability of an Event P(E):** (Number of favorable outcomes) / (Total number of outcomes).

### Random Variables

A variable whose value is a numerical outcome of a random phenomenon.
*   **Discrete Random Variable:** Takes on a finite or countably infinite number of values (e.g., number of heads in 3 coin flips).
*   **Continuous Random Variable:** Takes on any value within a given range (e.g., height of a person).

### Probability Distributions

A function that describes all possible values and likelihoods that a random variable can take within a given range.

*   **Bernoulli Distribution:** Models the probability of success (1) or failure (0) for a single trial.
*   **Binomial Distribution:** Models the number of successes in a fixed number of independent Bernoulli trials.
*   **Poisson Distribution:** Models the number of events occurring in a fixed interval of time or space, given a constant average rate of occurrence.
*   **Normal (Gaussian) Distribution:** A bell-shaped, symmetric continuous distribution characterized by its mean (μ) and standard deviation (σ). Many natural phenomena follow this distribution.

### Python Example: Normal Distribution Plot

```python
import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import norm

# Parameters for the normal distribution
mu = 0    # Mean
sigma = 1 # Standard Deviation

# Generate data points
x = np.linspace(mu - 3*sigma, mu + 3*sigma, 100)

# Calculate the probability density function (PDF)
pdf = norm.pdf(x, mu, sigma)

plt.figure(figsize=(8, 4))
plt.plot(x, pdf, label='Normal PDF')
plt.title('Standard Normal Distribution (μ=0, σ=1)')
plt.xlabel('X')
plt.ylabel('Probability Density')
plt.grid(True)
plt.legend()
plt.show()
```

## 3. Inferential Statistics

Inferential statistics uses a sample to make inferences about a larger population.

### Sampling

The process of selecting a representative subset of a population for study. **Random sampling** is crucial for unbiased inferences.

### Central Limit Theorem (CLT)

States that the distribution of sample means (or sums) from any population will be approximately normal, regardless of the population's distribution, as long as the sample size is sufficiently large (typically n > 30). This theorem is fundamental for hypothesis testing and confidence intervals.

### Confidence Intervals

A range of values within which the true population parameter is estimated to lie, with a specified probability (e.g., 95% confidence interval). It quantifies the uncertainty in an estimate.

### Hypothesis Testing

A statistical method used to make decisions about a population based on sample data.

*   **Null Hypothesis (H₀):** A statement of no effect or no difference. Assumed true until evidence suggests otherwise.
*   **Alternative Hypothesis (H₁):** A statement that contradicts the null hypothesis. What we are trying to find evidence for.
*   **P-value:** The probability of observing data as extreme as (or more extreme than) what was observed, assuming the null hypothesis is true. A small p-value (typically < 0.05) leads to rejection of H₀.
*   **Type I Error (α):** Rejecting H₀ when it is actually true (False Positive).
*   **Type II Error (β):** Failing to reject H₀ when it is false (False Negative).

#### Common Hypothesis Tests:

*   **t-tests:** Used to compare means of one or two groups.
    *   *One-sample t-test:* Compares the mean of a single sample to a known population mean.
    *   *Independent samples t-test:* Compares the means of two independent groups.
    *   *Paired samples t-test:* Compares the means of two related groups (e.g., before and after treatment).
*   **ANOVA (Analysis of Variance):** Used to compare means of three or more groups.
*   **Chi-squared (χ²) Tests:** Used for categorical data.
    *   *Chi-squared Test of Independence:* Checks if there is a significant association between two categorical variables.
    *   *Chi-squared Goodness-of-Fit Test:* Checks if a sample distribution matches a hypothesized population distribution.

### Python Example: Independent Samples t-test

```python
from scipy import stats
import numpy as np

# Sample data for two independent groups
group_a = [22, 25, 23, 27, 26, 24, 28, 20, 29]
group_b = [19, 21, 18, 20, 22, 17, 23, 16, 21]

# Perform independent samples t-test
# equal_var=True assumes equal population variances (Student's t-test)
# equal_var=False assumes unequal population variances (Welch's t-test)
t_statistic, p_value = stats.ttest_ind(group_a, group_b, equal_var=False)

print(f"T-statistic: {t_statistic:.2f}")
print(f"P-value: {p_value:.3f}")

alpha = 0.05
if p_value < alpha:
    print("Reject the null hypothesis: There is a significant difference between the group means.")
else:
    print("Fail to reject the null hypothesis: There is no significant difference between the group means.")
```

## 4. A/B Testing Principles

A/B testing (or split testing) is a randomized controlled experiment used to compare two versions of a webpage, app feature, or marketing campaign to determine which performs better.
*   **Control Group (A):** The original version.
*   **Treatment Group (B):** The modified version.
*   **Random Assignment:** Users are randomly assigned to either A or B to ensure groups are comparable.
*   **Statistical Significance:** Hypothesis testing is used to determine if the observed difference in metrics (e.g., conversion rate, click-through rate) between A and B is statistically significant or due to random chance.

## 5. Correlation vs. Causation

*   **Correlation:** Describes the strength and direction of a linear relationship between two variables. If two variables are correlated, they tend to change together. Correlation does not imply causation.
    *   *Positive Correlation:* As one variable increases, the other tends to increase.
    *   *Negative Correlation:* As one variable increases, the other tends to decrease.
    *   *Zero Correlation:* No linear relationship.
*   **Causation:** Implies that one event is the result of the occurrence of the other event. Establishing causation requires controlled experiments or advanced statistical techniques (e.g., causal inference).

**Example:** Ice cream sales and drowning incidents are positively correlated, but neither causes the other; both are influenced by a common lurking variable: warm weather.

## Quick Checklist/Exercise:

1.  If a dataset has an extreme outlier, which measure of central tendency (mean or median) would be more representative of the typical value, and why?
2.  Explain the significance of the Central Limit Theorem in the context of inferential statistics.
3.  Distinguish between a Type I and a Type II error in hypothesis testing. Provide a simple analogy for each.